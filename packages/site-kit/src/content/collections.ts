import path from 'node:path'

import { defineCollections, defineDocs } from 'fumadocs-mdx/config'

import { schemas } from './schema.ts'

/**
 * Collection definitions for the shared content tree.
 *
 * Both apps re-export these from their own `source.config.ts`, so the content
 * model — including the file-name pattern that makes a translation visible — has
 * exactly one definition.
 *
 * fumadocs-mdx resolves a relative `dir` against `process.cwd()`, which is the
 * app directory when `waku build`/`waku dev` runs, so the shared tree is
 * addressed relative to `<repo>/sites/<name>/`.
 */

/** `<repo>/content`, the one content tree both sites read. */
export function contentRoot(): string {
  return path.resolve(process.cwd(), '../../content')
}

/**
 * Entry files: a default `index.md(x)` plus optional `index.en.md(x)` and
 * `index.zh.md(x)` overlays. Both Markdown and MDX are supported.
 *
 * The locale suffix is not decoration: the collection's own glob decides which
 * files the loaders ever see (`import.meta.glob` in the generated `.source/`),
 * and the i18n `dot` parser only *then* splits them into a per-language storage.
 * A pattern that misses `index.zh.md` silently publishes no Chinese content, so
 * the patterns are exported for `packages/site-kit/src/__tests__` to guard.
 */
export const COLLECTION_GLOBS = {
  authors: ['*/index{,.en,.zh}.{md,mdx}'],
  events: ['*/index{,.en,.zh}.{md,mdx}'],
  fundings: ['*/index{,.en,.zh}.{md,mdx}'],
  /** Patents live one level deeper (`pat/<slug>/index.mdx`), hence the recursion. */
  pages: ['**/index{,.en,.zh}.{md,mdx}'],
  publications: ['**/index{,.en,.zh}.{md,mdx}'],
} as const

export type CollectionFamily = keyof typeof COLLECTION_GLOBS

function collectionDir(family: CollectionFamily): string {
  return path.join(contentRoot(), family)
}

export const authorDocs = defineCollections({
  dir: collectionDir('authors'),
  files: [...COLLECTION_GLOBS.authors],
  schema: schemas.authors,
  type: 'doc',
})

export const eventDocs = defineCollections({
  dir: collectionDir('events'),
  files: [...COLLECTION_GLOBS.events],
  schema: schemas.events,
  type: 'doc',
})

export const fundingDocs = defineCollections({
  dir: collectionDir('fundings'),
  files: [...COLLECTION_GLOBS.fundings],
  schema: schemas.fundings,
  type: 'doc',
})

export const publicationDocs = defineCollections({
  dir: collectionDir('publications'),
  files: [...COLLECTION_GLOBS.publications],
  schema: schemas.publications,
  type: 'doc',
})

/** Landing pages, listing pages and legal pages, with their section tree. */
export const pageDocs = defineDocs({
  dir: collectionDir('pages'),
  docs: { files: [...COLLECTION_GLOBS.pages], schema: schemas.pages },
})
