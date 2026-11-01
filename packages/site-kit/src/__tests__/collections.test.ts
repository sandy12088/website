import type { ContentFamily } from '../content/schemas.ts'

import { globSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { COLLECTION_GLOBS } from '../content/collections.ts'
import { schemaFor } from '../content/schemas.ts'
import {
  authorSlugs,
  collectionEntries,
  contentRoot,
} from './content-fixtures.ts'

/**
 * Every migrated file must satisfy the schema its collection declares.
 *
 * Fumadocs runs the same schemas inside the build; this suite covers the merged
 * front matter shape as data, so a bad value is
 * reported with its file and path rather than only surfacing in a Vite
 * transform error.
 */

/**
 * Validate front matter with the exact schema its collection uses.
 *
 * `schemaFor` is the same lookup `source.config.ts` performs, so a key that
 * satisfies this suite cannot fail the collection at build time.
 */
function validate(family: ContentFamily, data: unknown): string[] {
  const parsed = schemaFor(family).safeParse(data)
  if (parsed.success) return []
  return parsed.error.issues.map(
    issue => `${issue.path.join('.')}: ${issue.message}`,
  )
}

describe('content model', () => {
  const entries = collectionEntries()

  it('finds every migrated collection entry', () => {
    expect(entries.length).toBeGreaterThan(0)
    for (const family of [
      'authors',
      'events',
      'fundings',
      'pages',
      'publications',
    ]) {
      expect(
        entries.filter(entry => entry.family === family).length,
        family,
      ).toBeGreaterThan(0)
    }
  })

  it.each(collectionEntries())('$file satisfies its schema', entry => {
    const issues = validate(entry.family as ContentFamily, entry.data)
    if (issues.length > 0)
      throw new Error(`${entry.file}: ${issues.join('; ')}`)
  })
})

describe('Chinese content coverage', () => {
  const entries = collectionEntries()
  const translations = new Map(
    entries
      .filter(entry => entry.locale === 'zh')
      .map(entry => [entry.file.replace(/\.zh\.mdx?$/, ''), entry]),
  )

  it.each(entries.filter(entry => entry.locale === 'default'))(
    '$file provides Chinese introductions or explicit placeholders',
    entry => {
      if (entry.family === 'authors' && !entry.data['title']) return
      const key = entry.file.replace(/\.mdx?$/, '')
      const translatedFile = `${key}.zh.md`
      const translated = translations.get(key)
      if (['authors', 'pages', 'fundings'].includes(entry.family)) {
        expect(translated, `Add ${translatedFile}`).toBeDefined()
      }
      for (const field of ['abstract', 'summary']) {
        const original = entry.data[field]
        if (typeof original !== 'string' || original.trim().length === 0)
          continue
        const chinese = translated?.data[field]
        expect(
          chinese,
          `Add ${translatedFile} with Chinese ${field} or a placeholder`,
        ).toMatch(/\p{Script=Han}/u)
      }
      const originalBody = entry.body.trim()
      if (originalBody.length === 0) return
      expect(
        translated,
        `Add ${translatedFile} for the translated body`,
      ).toBeDefined()
      if (translated) {
        expect(
          translated.body,
          `Add Chinese body text or a placeholder to ${translated.file}`,
        ).toMatch(/\p{Script=Han}/u)
      }
    },
  )
})

describe('collection globs', () => {
  /**
   * The collection's own glob decides which files the loaders ever see, and the
   * i18n `dot` parser only splits them afterwards. A pattern that misses
   * `index.zh.md` therefore publishes no Chinese content at all — this is the
   * guard for that (the bug the split fixed).
   */
  it('matches the translated sibling of every entry', () => {
    let translations = 0

    for (const [family, patterns] of Object.entries(COLLECTION_GLOBS)) {
      const dir = path.join(contentRoot, family)
      const matched = new Set(
        patterns.flatMap(pattern => globSync(pattern, { cwd: dir })),
      )
      const translated = globSync('**/index.zh.{md,mdx}', { cwd: dir })

      for (const file of translated) {
        translations += 1
        expect(matched.has(file), `${family}/${file}`).toBe(true)
      }
    }

    // The tree does have translations, so the loop above is a real guard.
    expect(translations).toBeGreaterThan(0)
  })

  it('does not sweep in files that are not entries', () => {
    for (const [family, patterns] of Object.entries(COLLECTION_GLOBS)) {
      const dir = path.join(contentRoot, family)
      const matched = patterns.flatMap(pattern =>
        globSync(pattern, { cwd: dir }),
      )

      for (const file of matched) {
        expect(path.basename(file)).toMatch(/^index(\.(en|zh))?\.mdx?$/)
      }
    }
  })
})

describe('author references', () => {
  const known = new Set(authorSlugs())

  it('resolves referenced local authors', () => {
    const referenced = new Set<string>()
    for (const entry of collectionEntries()) {
      const authors = entry.data['authors']
      if (Array.isArray(authors)) {
        for (const author of authors)
          if (typeof author === 'string') referenced.add(author)
      }
    }

    const local = [...referenced].filter(author => known.has(author))
    expect(local.length).toBeGreaterThan(0)
    // External collaborators intentionally have no profile directory; every
    // reference that *does* have one must use the exact directory name.
    for (const author of local) expect(known.has(author)).toBe(true)
  })

  it('never mixes upper case or underscores into an author key', () => {
    for (const entry of collectionEntries()) {
      const authors = entry.data['authors']
      if (!Array.isArray(authors)) continue
      for (const author of authors) {
        if (typeof author === 'string') expect(author).not.toMatch(/[A-Z_]/)
      }
    }
  })
})
