import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { readContentEntry } from '../content-overlays.ts'

/**
 * Walk up from this file until the repository root.
 *
 * Marked by `pnpm-workspace.yaml` next to the shared `content/` tree rather than
 * by a fixed depth, so the tests keep working wherever the kit sits in the
 * workspace.
 */
function findRoot(start: string): string {
  let dir = start
  for (;;) {
    if (
      existsSync(path.join(dir, 'pnpm-workspace.yaml')) &&
      existsSync(path.join(dir, 'content'))
    ) {
      return dir
    }
    const parent = path.dirname(dir)
    if (parent === dir) throw new Error(`no repository root above ${start}`)
    dir = parent
  }
}

const ROOT = findRoot(path.dirname(fileURLToPath(import.meta.url)))

/** `<repo>/content`, the one content tree both sites read. */
export const contentRoot = path.join(ROOT, 'content')

export interface FrontMatterFile {
  /** `content/<family>/<slug>/index.mdx` relative to the repo root. */
  file: string
  family: string
  /** Directory name, which is the route slug. */
  slug: string
  locale: 'default' | 'en' | 'zh'
  data: Record<string, unknown>
  body: string
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (/\.mdx?$/.test(entry.name)) out.push(full)
  }
  return out
}

/**
 * Every collection entry, with the same raw merge used before build validation.
 */
export function collectionEntries(family?: string): FrontMatterFile[] {
  const families = family
    ? [family]
    : readdirSync(contentRoot, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)

  const out: FrontMatterFile[] = []
  for (const name of families) {
    const base = path.join(contentRoot, name)
    if (!existsSync(base)) continue
    for (const file of walk(base)) {
      const basename = path.basename(file)
      const match = /^index(?:\.(en|zh))?\.mdx?$/.exec(basename)
      if (!match) continue
      const entry = readContentEntry(file)
      out.push({
        data: entry.data,
        body: entry.body,
        family: name,
        file: path.relative(ROOT, file),
        locale: match[1] === 'zh' ? 'zh' : match[1] === 'en' ? 'en' : 'default',
        slug: path.basename(path.dirname(file)),
      })
    }
  }
  return out
}

/** Author slugs that have a profile directory. */
export function authorSlugs(): string[] {
  return readdirSync(path.join(contentRoot, 'authors'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
}
