#!/usr/bin/env node
/**
 * Regenerate `packages/site-kit/src/components/icon-data.ts`.
 *
 * The icon keys come from the authored front matter (`icon: academicons/arxiv`,
 * `icon: at-symbol`) exactly as Hugo resolved them through
 * `partials/functions/get_icon.html`, which looked names up in the Hugo Blox
 * data files. Those files live in the Hugo module cache, so this script is only
 * runnable while `.references/` and the module cache are still present; the
 * generated module is committed so the built site has no Hugo dependency.
 *
 * Usage: node scripts/generate-icon-data.mjs
 *
 * Prerequisites, both removed with the Hugo migration: the Hugo Blox module
 * cache (`~/Library/Caches/hugo_cache`) and `hugo-public/people/`, which is where
 * the Academicons paths were harvested from.
 * `packages/site-kit/src/components/icon-data.ts` is committed, so this only
 * needs running to add an icon or to recover from a corrupted file.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { parse } from 'yaml'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const OUT = path.join(ROOT, 'packages/site-kit/src/components/icon-data.ts')

const ICON_DIR = path.join(
  os.homedir(),
  'Library/Caches/hugo_cache/modules/filecache/modules/pkg/mod',
  'github.com/!hugo!blox/hugo-blox-builder/modules/blox-tailwind@v0.3.3-0.20250301201144-44e75541f7be/data/icons',
)

/** Every icon referenced by authored front matter or by a ported component. */
const NEEDED = [
  // author profiles (`profiles[].icon`)
  'academicons/arxiv',
  'academicons/google-scholar',
  'academicons/orcid',
  'academicons/researchgate',
  'arxiv',
  'at-symbol',
  'brands/github',
  'envelope',
  'google-scholar',
  'hero/home',
  'researchgate',
  // hero action
  'sparkles',
  // attachment links (`page_links.html`)
  'circle-stack',
  'code-bracket',
  'document',
  'document-duplicate',
  'document-text',
  'link',
  'photo',
  'presentation-chart-bar',
  'video-camera',
  // resume blocks
  'academic-cap',
  'trophy',
  // chrome
  'arrow-top-right-on-square',
  'bars-3',
  'calendar-days',
  'chevron-right',
  'moon',
  'sun',
  'x-mark',
]

/** Split an `<svg ...>...</svg>` literal into its `viewBox` and inner markup. */
function fromSvgLiteral(svg) {
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1] ?? '0 0 24 24'
  const body = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
  const fill = /^<svg\b[^>]*\bfill="([^"]+)"/.exec(svg)?.[1]
  return {
    body: (fill ? `<g fill="${fill}">${body}</g>` : body)
      .replace(/\s+/g, ' ')
      .trim(),
    viewBox,
  }
}

function readSets() {
  const hero = JSON.parse(
    readFileSync(path.join(ICON_DIR, 'hero.json'), 'utf8'),
  ).icons
  const blox = parse(readFileSync(path.join(ICON_DIR, 'hb.yaml'), 'utf8')).icons
  const brands = parse(
    readFileSync(path.join(ICON_DIR, 'brands.yaml'), 'utf8'),
  ).icons
  const academicons = JSON.parse(
    readFileSync(path.join(ICON_DIR, 'academicons.json'), 'utf8'),
  ).icons
  return { academicons, blox, brands, hero }
}

/** Icons the previous build inlined, harvested from the built HTML. */
function fromBuiltHtml(iconDir) {
  const { readFileSync: read } = { readFileSync }
  const out = {}
  for (const entry of readdirSync(iconDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const file = path.join(iconDir, entry.name, 'index.html')
    if (!existsSync(file)) continue
    const html = read(file, 'utf8')
    for (const match of html.matchAll(/<a([^>]*)>\s*(<svg.*?<\/svg>)/gs)) {
      const label = /aria-label=([^ >]+)/.exec(match[1])
      if (!label) continue
      out[label[1].replaceAll('"', '')] = fromSvgLiteral(match[2])
    }
  }
  return out
}

function main() {
  const builtDir = path.join(ROOT, 'hugo-public/people')
  const sources = {
    built: existsSync(builtDir) ? fromBuiltHtml(builtDir) : {},
    ...readSets(),
  }

  const found = {}
  const missing = []

  for (const name of NEEDED) {
    if (sources.built[name]) {
      found[name] = sources.built[name]
      continue
    }
    const [prefix, bare] = name.includes('/')
      ? name.split('/', 2)
      : [undefined, name]
    if (prefix === 'brands' && sources.brands[bare]) {
      found[name] = fromSvgLiteral(sources.brands[bare])
      continue
    }
    if (
      (prefix === 'academicons' || prefix === undefined) &&
      sources.academicons[bare]
    ) {
      found[name] = {
        body: sources.academicons[bare].body.replace(/\s+/g, ' ').trim(),
        viewBox: '0 0 512 512',
      }
      continue
    }
    if (sources.hero[bare]) {
      const { body } = sources.hero[bare]
      found[name] = {
        body: body.replace(/\s+/g, ' ').trim(),
        viewBox: '0 0 24 24',
      }
      continue
    }
    if (sources.blox[bare]) {
      found[name] = fromSvgLiteral(sources.blox[bare])
      continue
    }
    missing.push(name)
  }

  if (missing.length > 0) {
    console.error(`No source for: ${missing.join(', ')}`)
    process.exit(1)
  }

  const lines = [
    '/**',
    ' * Inline SVG icons.',
    ' *',
    ' * Generated by `scripts/generate-icon-data.mjs` from the Hugo Blox icon data,',
    ' * using the same names the authored front matter referenced. Regenerate it',
    ' * rather than editing by hand.',
    ' */',
    '',
    '/** One icon: the inner SVG markup plus its `viewBox`. */',
    'export interface IconData {',
    '  body: string',
    '  viewBox: string',
    '}',
    '',
    '/**',
    ' * Every icon the site renders, keyed the way front matter names them.',
    ' *',
    ' * Typed as a partial record rather than a `const` object so an unknown key',
    ' * resolves to `undefined` at the type level: front matter names icons freely',
    ' * and a typo must render nothing instead of failing a build.',
    ' */',
    'export const ICONS: Partial<Record<string, IconData>> = {',
  ]
  for (const name of Object.keys(found).sort()) {
    lines.push(`  ${JSON.stringify(name)}: {`)
    lines.push(`    body: ${JSON.stringify(found[name].body)},`)
    lines.push(`    viewBox: ${JSON.stringify(found[name].viewBox)},`)
    lines.push('  },')
  }
  lines.push('}')
  lines.push('')

  writeFileSync(OUT, lines.join('\n'), 'utf8')
  console.log(
    `wrote ${Object.keys(found).length} icons to ${path.relative(ROOT, OUT)}`,
  )
}

main()
