import * as stylex from '@stylexjs/stylex'

import { translate } from '../content/strings.ts'
import { siteContext } from '../site-context.ts'
import { frameStyles } from '../styles/frame.stylex.ts'
import {
  FONT_SANS,
  FONT_SERIF,
  MOTION,
  TEXT,
  theme,
} from '../styles/tokens.stylex.ts'
import { BrandMark } from './brand-mark.tsx'
import { controlStyles } from './ui/control.stylex.ts'

const DARK = '[data-theme="dark"]'

/** Evaluated at module load; the site is a static export, so this is the build year. */
const BUILD_YEAR = new Date().getFullYear()

const styles = stylex.create({
  brand: {
    alignItems: 'center',
    color: {
      default: theme.fg,
      [stylex.when.ancestor(DARK)]: '#e9eeec',
    },
    columnGap: '0.5rem',
    display: 'inline-flex',
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.small,
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  brandMark: {
    blockSize: '1.125rem',
    inlineSize: '1.125rem',
  },
  footer: {
    borderBlockStartColor: {
      default: theme.border,
      [stylex.when.ancestor(DARK)]: '#232d35',
    },
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: 1,
    marginBlockStart: 'clamp(3rem, 7vw, 5rem)',
    paddingBlock: '2.25rem',
  },
  licenceLink: {
    color: 'inherit',
    textDecorationColor: {
      default: theme.borderStrong,
      [stylex.when.ancestor(DARK)]: '#34424c',
    },
    textDecorationLine: 'underline',
    textUnderlineOffset: 2,
    ':hover': {
      color: {
        default: theme.accent,
        [stylex.when.ancestor(DARK)]: '#a0baff',
      },
    },
  },
  /** The licence sentence sets in the serif face as the page's colophon. */
  notice: {
    color: {
      default: theme.fgMuted,
      [stylex.when.ancestor(DARK)]: '#a9b4ba',
    },
    fontFamily: FONT_SERIF.family,
    fontSize: TEXT.small,
    lineHeight: 1.6,
    marginBlock: 0,
    maxWidth: 'fit-content',
  },
  row: {
    alignItems: 'flex-end',
    columnGap: '2rem',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: '1.5rem',
  },
  side: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '0.8rem',
  },
  sideEnd: {
    alignItems: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '0.8rem',
  },
  beian: {
    color: theme.fgMuted,
    display: 'flex',
    flexWrap: 'wrap',
    fontSize: TEXT.micro,
    gap: '0.3rem',
    fontFamily: FONT_SANS.family,
    textDecorationLine: 'none',
  },
  toTop: {
    alignItems: 'center',
    color: {
      default: theme.fgMuted,
      [stylex.when.ancestor(DARK)]: '#a9b4ba',
    },
    columnGap: '0.375rem',
    display: 'inline-flex',
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.micro,
    fontWeight: 500,
    textDecorationLine: 'none',
    transitionDuration: MOTION.hover,
    transitionProperty: 'color',
    transitionTimingFunction: MOTION.easeOut,
    ':hover': {
      color: {
        default: theme.accent,
        [stylex.when.ancestor(DARK)]: '#a0baff',
      },
    },
  },
})

/**
 * Footer.
 *
 * A colophon rather than a sitemap: the wordmark and the licence sentence on the
 * left, the return-to-top link on the right. The licence is a link inside the
 * notice itself, so it does not need a second badge competing for attention.
 */
export function Footer() {
  const { locale, site } = siteContext()
  const license = site.license
  const t = translate(locale)
  const parts = t.footerNotice.split('{license}')
  const before = parts[0] ?? ''
  const after = parts[1] ?? ''
  const fill = (template: string): string =>
    template
      .replaceAll('{title}', site.shortTitle)
      .replaceAll('{year}', String(BUILD_YEAR))

  return (
    <footer {...stylex.props(styles.footer)}>
      <div {...stylex.props(frameStyles.container)}>
        <div {...stylex.props(styles.row)}>
          <div {...stylex.props(styles.side)}>
            <div {...stylex.props(styles.brand)}>
              <BrandMark xstyle={styles.brandMark} />
              {site.shortTitle}
            </div>
            <p {...stylex.props(styles.notice)}>
              {fill(before)}
              <a
                href={license.url}
                rel="noopener noreferrer"
                target="_blank"
                {...stylex.props(styles.licenceLink)}
              >
                {license.name}
              </a>
              {fill(after)}
            </p>
            {locale === 'zh' && (
              <nav aria-label="beian">
                <a
                  href="https://beian.miit.gov.cn/"
                  {...stylex.props(styles.beian)}
                >
                  <img
                    width="20"
                    height="20"
                    src="https://qcloudimg.tencent-cloud.cn/raw/eed02831a0e201b8d794c8282c40cf2e.png"
                  />
                  闽ICP备2024081965号-2
                </a>
              </nav>
            )}
          </div>
          <div {...stylex.props(styles.sideEnd)}>
            <a
              href="#main"
              {...stylex.props(styles.toTop, controlStyles.nativeFocusVisible)}
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="12"
                viewBox="0 0 12 12"
                width="12"
              >
                <path
                  d="M6 10V2M2.5 5.5 6 2l3.5 3.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
              {t.backToTop}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
