import type { SiteConfig } from '@yhma/site-kit'

/**
 * Chinese site identity.
 *
 * Serves the same routes as the English site, on its own origin, with the
 * Chinese storage of the shared content tree. `alternate` is the English site
 * the language switch links to.
 */
export const site = {
  alternate: {
    baseUrl: 'https://yhmayyds.group',
    label: 'English',
    locale: 'en',
  },
  baseUrl: 'https://magroup.ac.cn',
  description:
    '马宇翰研究组主页：量子热力学、有限时间热力学与非平衡统计物理的研究与教学',
  googleAnalyticsId: 'G-H0VB6P6W7B',
  /** `languageCode`, used for the `<html lang>` attribute. */
  languageCode: 'zh-Hans',
  license: {
    name: 'CC BY-NC-SA 4.0',
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  },
  locale: 'zh',
  orgName: '马宇翰研究组',
  repository: {
    branch: 'main',
    contentDir: 'content',
    url: 'https://github.com/yhma-lab/website',
  },
  shortTitle: '马宇翰研究组',
  title: '马宇翰研究组',
} satisfies SiteConfig
