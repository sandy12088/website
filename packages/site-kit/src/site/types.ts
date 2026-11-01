/**
 * Site identity.
 *
 * The two sites are separate builds of the same kit, so everything that differs
 * between them lives in one object per app: `<site>/src/site.config.ts`.
 *
 * `alternate` is the other site in the pair; it is what the language switch
 * links to and what `hreflang` alternates in the sitemap point at.
 */

/** A site's language; unsuffixed content is a neutral fallback for either. */
export type Locale = 'en' | 'zh'

export interface NavItem {
  label: string
  /** Root-relative route; both sites serve the same paths. */
  to: string
  /** A same-page anchor such as `#news`. */
  hash?: string
}

export interface AlternateSite {
  locale: Locale
  /** Origin without a trailing slash, e.g. `https://magroup.ac.cn`. */
  baseUrl: string
  /** Label shown on the switch, written in the target language. */
  label: string
}

export interface SiteConfig {
  locale: Locale
  /** Canonical origin without a trailing slash. */
  baseUrl: string
  alternate: AlternateSite
  /** `languageCode`, used for `<html lang>` and the feed. */
  languageCode: string
  /** `<title>` and the site name in structured data. */
  title: string
  /** Brand text in the navbar and the footer copyright. */
  shortTitle: string
  description: string
  /** `org_name`, used for the structured-data publisher. */
  orgName: string
  license: { name: string; url: string }
  repository: { branch: string; contentDir: string; url: string }
  googleAnalyticsId: string
}
