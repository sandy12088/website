import * as stylex from '@stylexjs/stylex'

import { alternateUrl, siteHref } from '../content/links.ts'
import { translate } from '../content/strings.ts'
import { siteContext } from '../site-context.ts'
import { navFor } from '../site/nav.ts'
import { frameStyles } from '../styles/frame.stylex.ts'
import { BrandMark } from './brand-mark.tsx'
import { styles } from './navbar.stylex.ts'
import { NavigationDisclosure } from './navigation-disclosure.tsx'
import { ThemeToggle } from './theme-toggle.tsx'
import { controlStyles } from './ui/control.stylex.ts'

/**
 * Server-owned navigation.
 *
 * Every link is a native anchor; the only client island is the disclosure that
 * controls their mobile visibility. The active page marker is written by the
 * document bootstrap as `aria-current="page"` and painted by a single rule in
 * `global.css`, because StyleX cannot select an attribute.
 */
export function Navbar() {
  const { locale, site } = siteContext()
  const nav = navFor(locale)
  const alternate = site.alternate
  const t = translate(locale)

  return (
    <div {...stylex.props(styles.wrapper)}>
      <header {...stylex.props(styles.header)}>
        <div {...stylex.props(frameStyles.container)}>
          <nav aria-label={t.navigation.label} {...stylex.props(styles.nav)}>
            <a
              href="/"
              title={site.title}
              {...stylex.props(styles.brand, controlStyles.nativeFocusVisible)}
            >
              <BrandMark xstyle={styles.brandMark} />
              {site.shortTitle}
            </a>

            <NavigationDisclosure labels={t.navigation}>
              <ul {...stylex.props(styles.navList)} id="nav-menu">
                {nav.map(item => (
                  <li key={item.label}>
                    <a
                      href={siteHref(
                        item.hash === undefined
                          ? { to: item.to }
                          : { hash: item.hash, to: item.to },
                      )}
                      {...stylex.props(
                        styles.navLink,
                        controlStyles.nativeFocusVisible,
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </NavigationDisclosure>

            <div {...stylex.props(styles.actions)}>
              <a
                data-alt-site={alternate.baseUrl}
                href={alternateUrl(alternate.baseUrl, '/')}
                hrefLang={alternate.locale === 'zh' ? 'zh-Hans' : 'en'}
                lang={alternate.locale === 'zh' ? 'zh-Hans' : 'en'}
                {...stylex.props(
                  styles.langSwitch,
                  controlStyles.nativeFocusVisible,
                )}
              >
                {alternate.label}
              </a>
              <span aria-hidden="true" {...stylex.props(styles.divider)} />
              <ThemeToggle labels={t.appearance} />
            </div>
          </nav>
        </div>
      </header>
    </div>
  )
}
