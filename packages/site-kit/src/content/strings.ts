import type { Locale } from '../site/types.ts'

/**
 * Localized UI strings.
 *
 * The previous build pulled these from Hugo's i18n bundles
 * (`i18n/en.toml` and friends) for the resume blocks, the paginator and the
 * attachment buttons. Only the strings the ported components actually render are
 * kept here.
 */

export interface UiStrings {
  appearance: {
    label: string
    toDark: string
    toLight: string
  }
  navigation: {
    label: string
    open: string
    close: string
  }
  /** First focusable element on every page: jumps the frame to `<main>`. */
  skipToContent: string
  /** Labeled reading rows shared by the detail pages. */
  abstract: string
  summary: string
  /** Footer link that returns the reader to the top of a long page. */
  backToTop: string
  /** Heading for the talks archive, which has no authored page front matter. */
  events: string
  /** Group identifiers stay stable in content; only their headings are translated. */
  peopleGroups: Record<string, string>
  /** Accessible label and legend for the hero's thermodynamic diagram. */
  heroDiagram: {
    finiteTime: string
    ideal: string
    label: string
  }
  /** `404.html` heading. */
  notFoundTitle: string
  /** `404.html` sentence before the home link. */
  notFoundBody: string
  /** `404.html` link text. */
  notFoundHome: string
  /** `i18n "experience"` */
  experience: string
  /** `i18n "education"` */
  education: string
  /** `i18n "interests"` */
  interests: string
  /** `i18n "awards"` */
  awards: string
  /** `i18n "present"`, appended to an open-ended résumé date range. */
  present: string
  /**
   * `params.footer.copyright`
   * (`'yhma Lab © {year}. This site is licensed under {license}. Build with ❤️'`).
   *
   * A template rather than a formatted string: the licence is a link in the
   * footer, so the sentence is split on `{license}` and `{title}`/`{year}` are
   * substituted by the caller.
   */
  footerNotice: string
  /** `i18n "btn_pdf"` and friends, used by `page_links.html`. */
  buttons: {
    cite: string
    code: string
    dataset: string
    pdf: string
    poster: string
    project: string
    slides: string
    source: string
    video: string
  }
}

const EN: UiStrings = {
  appearance: {
    label: 'Appearance',
    toDark: 'Switch to dark appearance',
    toLight: 'Switch to light appearance',
  },
  navigation: {
    label: 'Main navigation',
    open: 'Open navigation',
    close: 'Close navigation',
  },
  abstract: 'Abstract',
  awards: 'Awards',
  events: 'Talks & events',
  peopleGroups: {},
  heroDiagram: {
    finiteTime: 'Finite-time cycle',
    ideal: 'Ideal Carnot cycle',
    label:
      'Temperature–entropy diagram comparing an ideal Carnot cycle with the finite-time cycle studied by the lab',
  },
  skipToContent: 'Skip to content',
  backToTop: 'Back to top',
  buttons: {
    cite: 'Cite',
    code: 'Code',
    dataset: 'Dataset',
    pdf: 'PDF',
    poster: 'Poster',
    project: 'Project',
    slides: 'Slides',
    source: 'Source',
    video: 'Video',
  },
  education: 'Education',
  experience: 'Experience',
  footerNotice:
    '{title} © {year}. This site is licensed under {license}. Build with ❤️',
  interests: 'Interests',
  notFoundBody: 'The page you are looking for does not exist.',
  notFoundHome: 'Back home',
  notFoundTitle: 'Page not found',
  present: 'Present',
  summary: 'Summary',
}

const CN: UiStrings = {
  appearance: {
    label: '外观',
    toDark: '切换为深色外观',
    toLight: '切换为浅色外观',
  },
  navigation: {
    label: '主导航',
    open: '展开导航',
    close: '收起导航',
  },
  abstract: '摘要',
  awards: '荣誉和奖励',
  events: '讲座与活动',
  peopleGroups: {
    'Principal Investigator': '研究组负责人',
    'Faculty Members': '教师',
    'Postdoctoral Scholars': '博士后',
    'Graduate Students': '研究生',
    Students: '学生',
    'Research Assistants': '研究助理',
    Collaborators: '合作成员',
    'Visiting Scholars': '访问学者',
    Alumni: '往届成员',
  },
  heroDiagram: {
    finiteTime: '有限时间循环',
    ideal: '理想卡诺循环',
    label: '温度—熵示意图：比较理想卡诺循环与本课题组研究的有限时间循环',
  },
  skipToContent: '跳转到正文',
  backToTop: '返回顶部',
  buttons: {
    cite: '引用',
    code: '代码',
    dataset: '数据集',
    pdf: 'PDF',
    poster: '海报',
    project: '项目',
    slides: '幻灯片',
    source: '源码',
    video: '视频',
  },
  education: '教育经历',
  experience: '工作经历',
  footerNotice:
    '{title} © {year}. 本站内容采用 {license} 许可协议。Build with ❤️',
  interests: '研究兴趣',
  notFoundBody: '你访问的页面不存在。',
  notFoundHome: '返回首页',
  notFoundTitle: '页面未找到',
  present: '至今',
  summary: '简介',
}

const BY_LOCALE: Record<Locale, UiStrings> = { en: EN, zh: CN }

export function translate(locale: Locale): UiStrings {
  return BY_LOCALE[locale]
}
