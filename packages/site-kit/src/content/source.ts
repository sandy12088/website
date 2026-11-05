import type {
  MetaData,
  Page,
  PageData,
  StaticSource,
} from 'fumadocs-core/source'
import type {
  DocCollectionEntry,
  DocsCollectionEntry,
} from 'fumadocs-mdx/runtime/server'
import type { DocData } from 'fumadocs-mdx/runtime/types'
import type { z } from 'zod'
import type { Locale, SiteConfig } from '../site/types.ts'
import type { ResolvedAuthor } from './authors.ts'
import type { PageFrontmatter, schemas, UserGroup } from './schema.ts'

import { loader } from 'fumadocs-core/source'
import { toFumadocsSource } from 'fumadocs-mdx/runtime/server'

import { authorProfiles, resolveAuthors } from './authors.ts'
import { createSiteI18n } from './i18n.ts'
import {
  byDateDesc,
  findBySlugs,
  peopleByGroup as groupPeople,
  peopleGroups,
} from './sort.ts'

/**
 * The content pipeline for one site.
 *
 * This is the seam between the two apps and the shared kit: an app owns the
 * generated collections (`<app>/.source/server.ts`, produced by fumadocs-mdx
 * from the shared content tree) and its site identity, and gets back a single
 * object whose accessors are already bound to that site's language. Everything
 * else — the loaders, URL shapes and default-content fallback — stays behind
 * this interface.
 */

export type AuthorData = z.infer<typeof schemas.authors>
export type EventData = z.infer<typeof schemas.events>
export type FundingData = z.infer<typeof schemas.fundings>
export type PublicationData = z.infer<typeof schemas.publications>

/**
 * A loaded content page, as the fumadocs loader returns it: the validated front
 * matter plus the compiled MDX body and TOC that only exist at runtime.
 */
export type StoredPage<Data extends PageData> = Page<
  string | undefined,
  Data & DocData
>
export type AuthorPage = StoredPage<AuthorData>
export type EventPage = StoredPage<EventData>
export type FundingPage = StoredPage<FundingData>
export type PagePage = StoredPage<PageFrontmatter>
export type PublicationPage = StoredPage<PublicationData>

/** Every supported page per language. */
export type AnyPage =
  AuthorPage | EventPage | FundingPage | PagePage | PublicationPage

/**
 * The generated collections an app hands to {@link createSource}.
 *
 * The app's `source.config.ts` re-exports the shared collection definitions, so
 * these entries carry the shared schemas' data types.
 */
export interface ContentInput {
  authorDocs: DocCollectionEntry<string, AuthorData>[]
  eventDocs: DocCollectionEntry<string, EventData>[]
  fundingDocs: DocCollectionEntry<string, FundingData>[]
  pageDocs: Pick<
    DocsCollectionEntry<string, PageFrontmatter>,
    'toFumadocsSource'
  >
  publicationDocs: DocCollectionEntry<string, PublicationData>[]
}

export interface ContentSource {
  /** The language this source is bound to. */
  locale: Locale
  allAuthors(): AuthorPage[]
  allEvents(): EventPage[]
  allFundings(): FundingPage[]
  allPages(): PagePage[]
  allPublications(): PublicationPage[]
  findAuthor(slugs: string[]): AuthorPage | undefined
  findEvent(slugs: string[]): EventPage | undefined
  findFunding(slugs: string[]): FundingPage | undefined
  findPage(slugs: string[]): PagePage | undefined
  findPublication(slugs: string[]): PublicationPage | undefined
  sortedEvents(): EventPage[]
  sortedFundings(): FundingPage[]
  sortedPublications(): PublicationPage[]
  featuredPublications(): PublicationPage[]
  peopleGroups(): UserGroup[]
  peopleByGroup(groups?: readonly UserGroup[]): {
    group: UserGroup
    people: AuthorPage[]
  }[]
  resolveAuthors(
    ids: readonly string[],
    notes?: readonly string[],
  ): ResolvedAuthor[]
  authorParams(): string[][]
  eventParams(): string[][]
  fundingParams(): string[][]
  /**
   * Params for the standalone pages: every entry of the `pages` collection
   * except the site root, which the `/` route renders itself. Which of these
   * the catch-all actually publishes is the router's business — it drops the
   * paths another route has already claimed.
   */
  pageParams(): string[][]
  publicationParams(): string[][]
  /** Whether an authored `index.zh.md(x)` exists for this URL. */
  hasTranslation(url: string): boolean
}

/**
 * Route parameters for a Waku catch-all page inside one language.
 *
 * `generateParams()` lists every language in the loader's i18n config, so the
 * site's own language is filtered out here.
 */
function paramsFor(
  source: { generateParams: () => { lang: string; slug: string[] }[] },
  locale: Locale,
): string[][] {
  return source
    .generateParams()
    .filter(entry => entry.lang === locale)
    .map(entry => entry.slug)
}

/**
 * The compiler has already merged explicit overlays. Materialize each missing
 * locale from the neutral default, never from another locale's override.
 */
function withDefaultContent<
  Data extends PageData & DocData,
  Meta extends MetaData,
>(
  source: StaticSource<{ pageData: Data; metaData: Meta }>,
): StaticSource<{ pageData: Data; metaData: Meta }> {
  const entries = new Map<string, (typeof source.files)[number]>()
  for (const file of source.files) {
    const key = file.path.replace(/\.mdx$/, '.md')
    if (entries.has(key))
      throw new Error(`Duplicate content entry: ${file.path}`)
    entries.set(key, file)
  }
  for (const file of source.files) {
    if (file.type !== 'page' || /\.(en|zh)\.mdx?$/.test(file.path)) continue
    entries.delete(file.path.replace(/\.mdx$/, '.md'))
    for (const locale of ['en', 'zh']) {
      const localized = file.path.replace(/\.mdx?$/, `.${locale}.md`)
      const overlay = entries.get(localized)
      if (overlay === undefined)
        entries.set(localized, { ...file, path: localized })
      else if (
        overlay.type === 'page' &&
        overlay.data._exports['_inheritsDefaultBody'] === true
      )
        entries.set(localized, {
          ...overlay,
          data: {
            ...overlay.data,
            body: file.data.body,
            toc: file.data.toc,
            structuredData: file.data.structuredData,
          },
        })
    }
  }
  return { ...source, files: [...entries.values()] }
}

export function createSource(
  input: ContentInput,
  site: Pick<SiteConfig, 'locale'>,
): ContentSource {
  const locale = site.locale
  const i18n = createSiteI18n()

  const authors = loader({
    baseUrl: '/people',
    i18n,
    source: withDefaultContent(toFumadocsSource(input.authorDocs, [])),
  })
  /**
   * `baseUrl` matches the URL the previous site published, not the collection
   * directory: an entry is `/publication/<slug>/` while its files live under
   * `content/publications/`.
   */
  const publications = loader({
    baseUrl: '/publication',
    i18n,
    source: withDefaultContent(toFumadocsSource(input.publicationDocs, [])),
  })
  const fundings = loader({
    baseUrl: '/funding',
    i18n,
    source: withDefaultContent(toFumadocsSource(input.fundingDocs, [])),
  })
  const events = loader({
    baseUrl: '/event',
    i18n,
    source: withDefaultContent(toFumadocsSource(input.eventDocs, [])),
  })
  const pages = loader({
    baseUrl: '',
    i18n,
    source: withDefaultContent(input.pageDocs.toFumadocsSource()),
  })

  /**
   * `content/authors/misc/` is a placeholder with no `title`; the previous site
   * never published a page for it, so it is skipped rather than rendered as an
   * untitled profile.
   */
  const authorPages: AuthorPage[] = authors
    .getPages(locale)
    .filter(page => page.data.title.length > 0)
  const eventPages: EventPage[] = events.getPages(locale)
  const fundingPages: FundingPage[] = fundings.getPages(locale)
  const pagePages: PagePage[] = pages.getPages(locale)
  const publicationPages: PublicationPage[] = publications.getPages(locale)

  // Publication bylines use the original names, not translated profile names.
  const profiles = authorProfiles(authors.getPages('en'))

  /** Authored translations only, not materialized default copies. */
  const translatedUrls = new Set<string>()
  for (const source of [authors, events, fundings, pages, publications]) {
    for (const page of source.getPages('zh')) {
      if (/\.zh\.mdx?$/.test(page.absolutePath ?? '')) {
        translatedUrls.add(page.url)
      }
    }
  }

  return {
    locale,
    allAuthors: () => authorPages,
    allEvents: () => eventPages,
    allFundings: () => fundingPages,
    allPages: () => pagePages,
    allPublications: () => publicationPages,
    authorParams: () => authorPages.map(page => page.slugs),
    eventParams: () => paramsFor(events, locale),
    featuredPublications: () =>
      byDateDesc(publicationPages).filter(page => page.data.featured),
    findAuthor: slugs => findBySlugs(authorPages, slugs),
    findEvent: slugs => findBySlugs(eventPages, slugs),
    findFunding: slugs => findBySlugs(fundingPages, slugs),
    findPage: slugs => findBySlugs(pagePages, slugs),
    findPublication: slugs => findBySlugs(publicationPages, slugs),
    fundingParams: () => paramsFor(fundings, locale),
    hasTranslation: url => translatedUrls.has(url),
    /** The site root is `[]`, and it is the `/` route's page, not a standalone one. */
    pageParams: () =>
      paramsFor(pages, locale).filter(slugs => slugs.length > 0),
    peopleByGroup: (groups?: readonly UserGroup[]) =>
      groupPeople(authorPages, groups),
    peopleGroups,
    publicationParams: () => paramsFor(publications, locale),
    resolveAuthors: (ids, notes = []) => resolveAuthors(profiles, ids, notes),
    sortedEvents: () => byDateDesc(eventPages),
    sortedFundings: () => byDateDesc(fundingPages),
    sortedPublications: () => byDateDesc(publicationPages),
  } satisfies ContentSource
}
