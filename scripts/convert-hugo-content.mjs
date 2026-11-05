#!/usr/bin/env node
/**
 * One-off Hugo -> fumadocs-mdx content conversion.
 *
 * Hugo and fumadocs disagree on three things:
 *
 *  1. file naming: Hugo uses `_index.md` for a section index and `.zh.md` for a
 *     translation; the new content tree uses `index.mdx` and `index.zh.md`.
 *     The collection globs in `packages/site-kit/src/content/collections.ts` must
 *     match both names, or a translation is never imported.
 *  2. front matter: Hugo carries several keys that only Hugo understands
 *     (`build`, `cascade`, `headless`, `widget`, `active`, `weight`,
 *     `type: landing`). They are dropped here; `source.config.ts` rejects
 *     anything it does not know about, so nothing else can slip through.
 *  3. assets: author images and publication attachments stay in their content
 *     bundles; the shared build publishes them at content-relative URLs.
 *
 * Run without arguments for a dry run, or with `--write` to modify the tree.
 *
 * The Hugo inputs were removed once this migration was verified, so this script
 * now needs them restored from git history first:
 *
 *   git show <migration-commit>^:content | ...   # or `git checkout <ref> -- content`
 *
 * It is kept because re-running it is the only way to prove that
 * `content/` still matches its source, and because the git history is
 * the backup for the original front matter.
 */
import { existsSync } from 'node:fs'
import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { parse, stringify } from 'yaml'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const SRC = path.join(ROOT, 'content')
const OUT = path.join(ROOT, 'content')
const PUBLIC = path.join(ROOT, 'public')

const WRITE = process.argv.includes('--write')

/** Front matter keys that only existed to drive Hugo. */
const DROPPED_KEYS = new Set([
  'active',
  'build',
  'cascade',
  'commentable',
  'editable',
  'headless',
  'share',
  'type',
  'view',
  'weight',
  'widget',
])

/** Keys whose values are date-looking strings and must stay strings. */
const DATE_KEYS = new Set([
  'date',
  'dateEnd',
  'date_end',
  'date_start',
  'publishDate',
])

const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg',
])

const report = { assets: 0, files: 0, skipped: [], warnings: [] }

/**
 * Author slug.
 *
 * Hugo taxonomies use `urlize` on the author key, so `cpSun` and `cpsun` are the
 * same term. The conversion uses the lower-cased directory name verbatim rather
 * than a kebab-case transform so that the generated directory name and the
 * `authors:` references in publications always agree.
 */
const authorSlug = name => name.toLowerCase().replaceAll(' ', '-')

/** Stable publication/funding/event slug: mirrors Hugo's content path rules. */
const contentSlug = name => name.toLowerCase()

function splitFrontMatter(source, file) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source)
  if (!match) {
    report.warnings.push(`${file}: no front matter block; treated as body-only`)
    return { body: source, data: {} }
  }
  return { body: match[2] ?? '', data: parse(match[1]) ?? {} }
}

function normalizeValue(key, value) {
  if (value === null || value === undefined) return undefined
  if (DATE_KEYS.has(key) && typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (Array.isArray(value)) {
    const items = value
      .map(item => normalizeValue(key, item))
      .filter(item => item !== undefined)
    return items.length > 0 ? items : undefined
  }
  if (typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      const normalized = normalizeValue(k, v)
      if (normalized !== undefined) out[k] = normalized
    }
    return Object.keys(out).length > 0 ? out : undefined
  }
  return value
}

function buildFrontMatter(data) {
  const out = {}
  for (const [key, value] of Object.entries(data)) {
    if (DROPPED_KEYS.has(key)) continue
    const normalized = normalizeValue(key, value)
    if (normalized === undefined) continue
    out[key] = normalized
  }
  return out
}

/**
 * Map a Hugo bundle file name onto its fumadocs-mdx name.
 *
 * `_index.md` is the bundle's own page, so it becomes the collection entry
 * `index.mdx`; `_index.zh.md` becomes its translation `index.zh.md`. Any other
 * file (`_info.zh.md`, `parttime.md`) is page *content* that Hugo appended to
 * whatever widget asked for it, so it keeps its own name and locale suffix
 * instead of clobbering the entry.
 */
function targetFileFor(name) {
  const locale = /\.zh\.mdx?$/.test(name) ? 'zh' : 'en'
  const bare = name.replace(/\.zh\.mdx?$/, '').replace(/\.mdx?$/, '')
  const isEntry = bare === '_index'
  if (isEntry)
    return { isEntry, name: locale === 'zh' ? 'index.zh.md' : 'index.mdx' }
  return {
    isEntry,
    name: `${bare.replace(/^_/, '')}${locale === 'zh' ? '.zh.md' : '.mdx'}`,
  }
}

/**
 * Rewrite `content/<type>/<dir>/` into `content/<outType>/<slug>/`.
 */
async function convertBundle({ dir, family }) {
  const files = await readdir(dir, { withFileTypes: true })
  const markdown = []
  const assets = []
  const written = new Set()
  const converted = new Map()
  const chineseFields = {}

  for (const entry of files) {
    if (entry.isDirectory()) {
      report.warnings.push(
        `${path.relative(SRC, path.join(dir, entry.name))}: nested directory not migrated`,
      )
      continue
    }
    const extension = path.extname(entry.name).toLowerCase()
    if (extension === '.md' || extension === '.mdx') markdown.push(entry.name)
    else assets.push(entry.name)
  }

  const slug = contentSlug(path.basename(dir))
  const targetDir = path.join(OUT, family, slug)

  for (const name of markdown) {
    const { isEntry, name: targetName } = targetFileFor(name)
    if (written.has(targetName)) {
      throw new Error(
        `${path.relative(SRC, dir)}: '${name}' and another source file both map to '${targetName}'`,
      )
    }
    written.add(targetName)

    const source = await readFile(path.join(dir, name), 'utf8')
    const { body, data } = splitFrontMatter(
      source,
      path.relative(ROOT, path.join(dir, name)),
    )

    if (family === 'authors') {
      if (Array.isArray(data['authors'])) {
        data['authors'] = data['authors'].map(item => authorSlug(item))
      }
      if (data['profiles'] === undefined && data['social'] !== undefined) {
        data['profiles'] = data['social']
      }
      delete data['social']
      delete data['experience']
      delete data['date_format']
      delete data['design']
      delete data['subtitle']
    }

    if (family.startsWith('publications') || family === 'events') {
      if (Array.isArray(data['authors'])) {
        data['authors'] = data['authors'].map(item => authorSlug(item))
      }
    }

    if (isEntry && targetName === 'index.mdx') {
      for (const field of ['title', 'abstract', 'summary']) {
        const translated =
          data[`${field}_zh`] ??
          (field === 'title' ? data['titel_zh'] : undefined)
        if (translated !== undefined) chineseFields[field] = translated
        delete data[`${field}_zh`]
      }
      delete data['titel_zh']
    }

    converted.set(targetName, { frontMatter: buildFrontMatter(data), body })
  }

  if (Object.keys(chineseFields).length > 0) {
    const chinese = converted.get('index.zh.md') ?? {
      frontMatter: {},
      body: '',
    }
    converted.set('index.zh.md', {
      ...chinese,
      frontMatter: { ...chineseFields, ...chinese.frontMatter },
    })
  }
  for (const [targetName, { frontMatter, body }] of converted) {
    const markdownOut = `---\n${stringify(frontMatter, { lineWidth: 0 }).trimEnd()}\n---\n\n${body.replace(/^\n+/, '')}`

    await emit(path.join(targetDir, targetName), markdownOut)
    report.files++
  }

  if (markdown.length === 0) {
    report.skipped.push(`${path.relative(SRC, dir)}: no markdown`)
  }

  return { assets, slug }
}

async function emit(file, contents) {
  if (!WRITE) return
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, contents, 'utf8')
}

async function copyAsset(from, to) {
  if (!WRITE) return
  await mkdir(path.dirname(to), { recursive: true })
  if (from !== to) await cp(from, to)
  report.assets++
}

/** Read only the top-level keys of a front matter block, for reporting. */
async function readKeys(file) {
  const source = await readFile(file, 'utf8')
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)
  if (!match) return []
  return Object.keys(parse(match[1]) ?? {})
}

async function main() {
  if (!existsSync(SRC)) {
    console.error(`No Hugo content directory at ${SRC}`)
    process.exit(1)
  }

  // content/authors/<slug>/  ->  content/authors/<slug>/
  const authorsDir = path.join(SRC, 'authors')
  for (const entry of await readdir(authorsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const dir = path.join(authorsDir, entry.name)
    const slug = authorSlug(entry.name)
    const { assets } = await convertBundle({
      dir,
      family: 'authors',
      origin: entry.name,
    })
    for (const asset of assets) {
      const extension = path.extname(asset).toLowerCase()
      if (IMAGE_EXTENSIONS.has(extension)) {
        await copyAsset(
          path.join(dir, asset),
          path.join(OUT, 'authors', slug, asset),
        )
      }
    }
  }

  // content/publication/<slug>/ (including the `pat` sub-family)
  const publicationDir = path.join(SRC, 'publication')
  for (const entry of await readdir(publicationDir, { withFileTypes: true })) {
    const dir = path.join(publicationDir, entry.name)
    const family = entry.name === 'pat' ? 'publications/pat' : 'publications'
    if (entry.isDirectory() && entry.name === 'pat') {
      for (const nested of await readdir(dir, { withFileTypes: true })) {
        if (!nested.isDirectory()) continue
        const nestedDir = path.join(dir, nested.name)
        const slug = contentSlug(nested.name)
        const { assets } = await convertBundle({
          dir: nestedDir,
          family,
          origin: `pat/${nested.name}`,
        })
        for (const asset of assets) {
          await copyAsset(
            path.join(nestedDir, asset),
            path.join(OUT, family, slug, asset),
          )
        }
      }
      continue
    }
    if (!entry.isDirectory()) continue
    const slug = contentSlug(entry.name)
    const { assets } = await convertBundle({
      dir,
      family: 'publications',
      origin: entry.name,
    })
    for (const asset of assets) {
      await copyAsset(
        path.join(dir, asset),
        path.join(OUT, 'publications', slug, asset),
      )
    }
  }

  for (const [family, source] of [
    ['fundings', 'funding'],
    ['events', 'event'],
  ]) {
    const base = path.join(SRC, source)
    if (!existsSync(base)) {
      report.warnings.push(`${source}/ is missing; no ${family} migrated`)
      continue
    }
    for (const entry of await readdir(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const dir = path.join(base, entry.name)
      const slug = contentSlug(entry.name)
      const { assets } = await convertBundle({
        dir,
        family,
        origin: entry.name,
      })
      for (const asset of assets) {
        await copyAsset(
          path.join(dir, asset),
          path.join(PUBLIC, family, slug, asset),
        )
      }
    }
  }

  // Top-level landing/legal pages -> content/pages/<slug>/
  const pages = [
    '_index.md',
    'publications.md',
    'fundings.md',
    'privacy.md',
    'terms.md',
  ]
  for (const name of pages) {
    const file = path.join(SRC, name)
    if (!existsSync(file)) {
      report.warnings.push(`${name}: missing`)
      continue
    }
    const isIndex = name === '_index.md'
    const slug = isIndex ? '' : contentSlug(name.replace(/\.md$/, ''))
    const target = path.join(OUT, 'pages', slug, 'index.mdx')
    const source = await readFile(file, 'utf8')
    const { body, data } = splitFrontMatter(source, name)
    if (name === 'privacy.md' || name === 'terms.md') {
      delete data['draft']
    }
    const markdownOut = `---\n${stringify(buildFrontMatter(data), { lineWidth: 0 }).trimEnd()}\n---\n\n${body.replace(/^\n+/, '')}`
    await emit(target, markdownOut)
    report.files++
    void readKeys
  }

  console.log(
    `${WRITE ? 'wrote' : 'would write'} ${report.files} content file(s), copied ${report.assets} asset(s)`,
  )
  if (report.skipped.length > 0)
    console.log('skipped:\n  ' + report.skipped.join('\n  '))
  if (report.warnings.length > 0)
    console.log('warnings:\n  ' + report.warnings.join('\n  '))
}

await main()
