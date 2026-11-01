import type { Locale, NavItem } from './types.ts'

/**
 * Main menu, in display order.
 *
 * The `News` entry points at the hero block on the home page, exactly as the
 * Hugo menu did (`config/_default/menu.yaml`).
 */

const EN: readonly NavItem[] = [
  { label: 'Home', to: '/' },
  { hash: 'news', label: 'News', to: '/' },
  { label: 'People', to: '/people' },
  { label: 'Publications', to: '/publications' },
  { label: 'Fundings', to: '/fundings' },
]

const CN: readonly NavItem[] = [
  { label: '首页', to: '/' },
  { hash: 'news', label: '新闻', to: '/' },
  { label: '成员', to: '/people' },
  { label: '论文发表', to: '/publications' },
  { label: '基金项目', to: '/fundings' },
]

export function navFor(locale: Locale): readonly NavItem[] {
  return locale === 'zh' ? CN : EN
}
