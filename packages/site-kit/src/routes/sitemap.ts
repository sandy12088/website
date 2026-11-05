import type { ContentSource } from '../content/source.ts'
import type { ApiHandler } from '../router/types.ts'
import type { SiteConfig } from '../site/types.ts'

import { absoluteUrl, alternateUrl } from '../content/links.ts'

/**
 * `sitemap.xml`.
 *
 * Reproduces the shape Hugo's `sitemap.xml` template emitted: one `<url>` per
 * published page with a `<lastmod>` and `<changefreq>weekly</changefreq>`. The
 * route list is derived from the content model rather than the built output, so
 * the sitemap cannot drift from it.
 *
 * Both sites publish the same paths, so every URL gets a `hreflang` pair —
 * except pages the other language has not translated yet, which is what
 * `source.hasTranslation` reports.
 *
 * The shared route table registers this as a static API route, so the response is
 * written to `dist/public/sitemap.xml` at build time.
 */

type Entry = { loc: string; lastmod: string }

function entries(source: ContentSource): Entry[] {
  const out: Entry[] = [{ lastmod: '', loc: '/' }]

  for (const page of source.allPages()) {
    out.push({ lastmod: page.data.date ?? '', loc: page.url })
  }
  for (const page of source.allPublications()) {
    out.push({ lastmod: page.data.date, loc: page.url })
  }
  for (const page of source.allFundings()) {
    out.push({ lastmod: page.data.date, loc: page.url })
  }
  for (const page of source.allAuthors()) {
    out.push({ lastmod: '', loc: page.url })
  }

  return out
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

/** Hugo's URLs end in a slash; the loader's do not. */
function normalize(pathname: string): string {
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

export function sitemapHandler(
  site: SiteConfig,
  source: ContentSource,
): ApiHandler {
  /** The static build calls this once, so the document is built in one pass. */
  return () => {
    const alternateLanguage =
      site.alternate.locale === 'zh' ? 'zh-Hans' : site.alternate.locale
    const urls = entries(source)
      .map(entry => {
        const path = normalize(entry.loc)
        const loc = `<loc>${escapeXml(absoluteUrl(site.baseUrl, path))}</loc>`
        const lastmod =
          entry.lastmod.length > 0
            ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>`
            : ''
        const alternates =
          entry.loc === '/' || source.hasTranslation(entry.loc)
            ? [
                `<xhtml:link rel="alternate" hreflang="${site.locale === 'zh' ? 'zh-Hans' : 'en'}" href="${escapeXml(absoluteUrl(site.baseUrl, path))}"/>`,
                `<xhtml:link rel="alternate" hreflang="${alternateLanguage}" href="${escapeXml(alternateUrl(site.alternate.baseUrl, path))}"/>`,
              ].join('')
            : ''
        return `<url>${loc}${lastmod}<changefreq>weekly</changefreq>${alternates}</url>`
      })
      .join('')

    const body = `<?xml version="1.0" encoding="utf-8" standalone="yes"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`

    return Promise.resolve(
      new Response(body, {
        headers: { 'content-type': 'application/xml' },
      }),
    )
  }
}
