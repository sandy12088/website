import type { ContentSource } from '../content/source.ts'
import type { ApiHandler } from '../router/types.ts'
import type { SiteConfig } from '../site/types.ts'

import { absoluteUrl } from '../content/links.ts'

/**
 * Site feed.
 *
 * Hugo published it at `/index.xml`; keeping that path avoids breaking existing
 * subscribers. Items are the same set the old RSS template listed: publications
 * and funded projects, newest first, each with a `pubDate` and a link. The
 * Chinese site gets its own feed in the same place, with its own titles and
 * absolute links.
 *
 * The handler is registered as a static API route by the shared route table, so
 * the response is written to `dist/public/index.xml` at build time.
 */

interface Item {
  date: string
  description: string
  link: string
  title: string
}

function items(source: ContentSource): Item[] {
  const publications = source.sortedPublications().map(page => ({
    date: page.data.date,
    description: page.data.abstract,
    link: page.url,
    title: page.data.title,
  }))
  const fundings = source.sortedFundings().map(page => ({
    date: page.data.date_start,
    description: page.data.description ?? '',
    link: page.url,
    title: page.data.title,
  }))

  return [...publications, ...fundings].toSorted(
    (a, b) => Date.parse(b.date) - Date.parse(a.date),
  )
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function ensureSlash(pathname: string): string {
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

export function feedHandler(
  site: SiteConfig,
  source: ContentSource,
): ApiHandler {
  /** The static build calls this once, so the body is built in one pass. */
  return () => {
    const list = items(source)
    const lastBuild = list[0]?.date ?? new Date().toISOString()

    const body = [
      '<?xml version="1.0" encoding="utf-8" standalone="yes"?>',
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>',
      `<title>${escapeXml(site.title)}</title>`,
      `<link>${site.baseUrl}/</link>`,
      `<atom:link href="${site.baseUrl}/index.xml" rel="self" type="application/rss+xml"/>`,
      `<description>${escapeXml(site.orgName)}</description>`,
      `<language>${site.languageCode}</language>`,
      `<lastBuildDate>${new Date(lastBuild).toUTCString()}</lastBuildDate>`,
      list
        .map(item =>
          [
            '<item>',
            `<title>${escapeXml(item.title)}</title>`,
            `<link>${escapeXml(absoluteUrl(site.baseUrl, ensureSlash(item.link)))}</link>`,
            `<guid>${escapeXml(absoluteUrl(site.baseUrl, ensureSlash(item.link)))}</guid>`,
            `<pubDate>${new Date(item.date).toUTCString()}</pubDate>`,
            `<description>${escapeXml(item.description)}</description>`,
            '</item>',
          ].join(''),
        )
        .join(''),
      '</channel></rss>',
    ].join('')

    return Promise.resolve(
      new Response(body, {
        headers: { 'content-type': 'application/rss+xml' },
      }),
    )
  }
}
