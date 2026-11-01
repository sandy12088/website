import type { Plugin } from 'vite'

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { frontmatter } from 'fumadocs-core/content/md/frontmatter'
import { z } from 'zod'

const fields = z.record(z.string(), z.unknown())

function parseContent(source: string) {
  // The upstream parser doesn't recognize a completely empty YAML block.
  return frontmatter(source.replace(/^---\r?\n(?=---(?:\r?\n|$))/, '---\n{}\n'))
}

function mapping(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Mappings inherit recursively; arrays and explicit empty values replace. */
function merge(
  base: Record<string, unknown>,
  overlay: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...base,
    ...Object.fromEntries(
      Object.entries(overlay).map(([key, value]) => [
        key,
        mapping(base[key]) && mapping(value) ? merge(base[key], value) : value,
      ]),
    ),
  }
}

/** Read an entry before schema defaults can mask fields omitted by a translation. */
export function readContentEntry(
  file: string,
  source = readFileSync(file, 'utf8'),
) {
  const parsed = parseContent(source)
  const data = fields.parse(parsed.data)
  const defaults = ['index.md', 'index.mdx'].map(name =>
    path.join(path.dirname(file), name),
  )
  const existing = defaults.filter(candidate => existsSync(candidate))
  if (existing.length > 1)
    throw new Error(`Duplicate default content: ${existing.join(', ')}`)
  const baseFile = existing[0]
  if (!/\/index\.(en|zh)\.mdx?$/.test(file) || baseFile === undefined)
    return { data, body: parsed.content, defaults, inheritsBody: false }

  const base = parseContent(readFileSync(baseFile, 'utf8'))
  const inheritsBody = parsed.content.trim().length === 0
  return {
    data: merge(fields.parse(base.data), data),
    body: inheritsBody ? base.content : parsed.content,
    defaults,
    inheritsBody,
  }
}

/** Merge raw fields before validation; inherit compiled bodies without changing format. */
export function contentOverlays(contentRoot: string): Plugin[] {
  const inheritedBodies = new Set<string>()
  return [
    {
      name: 'yhma:content-overlays',
      transform: {
        order: 'pre',
        handler(code, id) {
          const [file = '', query] = id.split('?')
          const params = new URLSearchParams(query)
          if (
            !file.startsWith(`${contentRoot}/`) ||
            !/\/index(?:\.(?:en|zh))?\.mdx?$/.test(file) ||
            params.has('raw') ||
            params.has('url')
          )
            return
          const entry = readContentEntry(file, code)
          for (const dependency of entry.defaults) this.addWatchFile(dependency)
          if (entry.inheritsBody) inheritedBodies.add(id)
          else inheritedBodies.delete(id)
          return {
            code: `---\n${JSON.stringify(entry.data)}\n---\n${entry.inheritsBody ? '' : entry.body}`,
            map: null,
          }
        },
      },
    },
    {
      name: 'yhma:content-body-inheritance',
      transform: {
        order: 'post',
        handler(code, id) {
          if (inheritedBodies.has(id))
            return {
              code: `${code}\nexport const _inheritsDefaultBody = true;`,
              map: null,
            }
          return null
        },
      },
    },
  ]
}
