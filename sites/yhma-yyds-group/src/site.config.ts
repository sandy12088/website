import type { SiteConfig } from '@yhma/site-kit'

/**
 * English site identity.
 *
 * This is the typed replacement for `config/_default/*.yaml` plus
 * `data/page_sharer.yaml`; `alternate` is the Chinese site the language switch
 * links to.
 */
export const site = {
  alternate: {
    baseUrl: 'https://magroup.ac.cn',
    label: '中文',
    locale: 'zh',
  },
  /** `baseURL` from `config/_default/hugo.yaml`. */
  baseUrl: 'https://yhmayyds.group',
  description:
    "Yuhan Ma's personal resume and detail infomation about his research group",
  /** `params.marketing.analytics.google_analytics`, also present in `.env` as `GA4_ID`. */
  googleAnalyticsId: 'G-H0VB6P6W7B',
  /** `languageCode`, used for the `<html lang>` attribute. */
  languageCode: 'en-US',
  license: {
    name: 'CC BY-NC-SA 4.0',
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  },
  locale: 'en',
  /** `org_name`, used for the structured-data publisher. */
  orgName: 'Yuhan Ma Lab',
  /** `features.repository` from `params.yaml`. */
  repository: {
    branch: 'main',
    contentDir: 'content',
    url: 'https://github.com/yhma-lab/website',
  },
  /** `params.header.navbar.logo.text`. */
  shortTitle: 'yhma Lab',
  /** `title` from `hugo.yaml`. */
  title: 'yhma lab',
} satisfies SiteConfig
