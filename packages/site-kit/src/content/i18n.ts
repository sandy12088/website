import { defineI18n } from 'fumadocs-core/i18n'

/**
 * Locale configuration for one site.
 *
 * Each locale lives on its own origin, without a URL prefix. The source
 * materializes missing locales from neutral defaults before the dot parser
 * runs; cross-language fallback would leak English-only overrides into Chinese.
 */
export function createSiteI18n() {
  return defineI18n({
    defaultLanguage: 'en',
    fallbackLanguage: null,
    hideLocale: 'always',
    languages: ['en', 'zh'],
    parser: 'dot',
  })
}
