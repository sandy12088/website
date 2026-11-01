import type { Locale } from '../site/types.ts'

import * as stylex from '@stylexjs/stylex'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { page, userEvent } from 'vitest/browser'

import { styles } from '../components/navbar.stylex.ts'
import { NavigationDisclosure } from '../components/navigation-disclosure.tsx'
import { controlStyles } from '../components/ui/control.stylex.ts'
import { siteHref } from '../content/links.ts'
import { translate } from '../content/strings.ts'
import { navigationBootstrap } from '../shell/bootstrap.ts'
import { navFor } from '../site/nav.ts'

function NavigationFixture({ locale = 'en' }: { locale?: Locale }) {
  const labels = translate(locale).navigation
  return (
    <nav aria-label={labels.label} {...stylex.props(styles.nav)}>
      <a
        href="#brand"
        {...stylex.props(styles.brand, controlStyles.nativeFocusVisible)}
      >
        Lab
      </a>
      <NavigationDisclosure labels={labels}>
        <ul id="nav-menu" {...stylex.props(styles.navList)}>
          {navFor(locale).map(item => (
            <li key={item.label}>
              <a
                href={siteHref(item)}
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
      <a
        data-alt-site="https://magroup.ac.cn"
        href="https://magroup.ac.cn/"
        hrefLang="zh-Hans"
        lang="zh-Hans"
        {...stylex.props(styles.langSwitch, controlStyles.nativeFocusVisible)}
      >
        中文
      </a>
      <button type="button">After navigation</button>
    </nav>
  )
}

const initialUrl = window.location.href
const labels = translate('en').navigation

beforeAll(() => {
  const script = document.createElement('script')
  script.textContent = navigationBootstrap
  document.head.append(script)
  script.remove()
})

beforeEach(async () => {
  await page.viewport(390, 800)
})

afterEach(() => {
  window.history.replaceState(null, '', initialUrl)
})

describe('responsive navigation', () => {
  it('starts collapsed on mobile with hidden links outside the tab order', async () => {
    const screen = await render(<NavigationFixture />)
    const toggle = screen.getByRole('button', { name: labels.open })
    await expect.element(toggle).toHaveAttribute('type', 'button')
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect
      .element(screen.container.querySelector<HTMLAnchorElement>('#nav-menu a'))
      .not.toBeVisible()
    expect(screen.container.querySelectorAll('#nav-menu')).toHaveLength(1)
    expect(
      screen.container.querySelector('[role="menu"], [role="menuitem"]'),
    ).toBeNull()
    const target = toggle.element().getAttribute('aria-controls')
    expect(target).toBeTruthy()
    expect(
      document
        .getElementById(target ?? '')
        ?.contains(screen.container.querySelector('#nav-menu')),
    ).toBe(true)

    screen.getByRole('link', { name: 'Lab' }).element().focus()
    await userEvent.tab()
    await expect.element(toggle).toHaveFocus()
    expect(
      Number.parseFloat(getComputedStyle(toggle.element()).outlineWidth),
    ).toBeGreaterThanOrEqual(2)
    expect(
      toggle.element().getBoundingClientRect().width,
    ).toBeGreaterThanOrEqual(44)
    expect(
      toggle.element().getBoundingClientRect().height,
    ).toBeGreaterThanOrEqual(44)
    await userEvent.tab()
    await expect
      .element(screen.getByRole('link', { name: '中文' }))
      .toHaveFocus()
  })

  it('uses Enter and Space, closes with Escape, and does not trap focus', async () => {
    const screen = await render(<NavigationFixture />)
    const toggle = screen.getByRole('button', { name: labels.open })
    toggle.element().focus()
    await userEvent.keyboard('{Enter}')
    await expect
      .element(screen.getByRole('button', { name: labels.close }))
      .toHaveAttribute('aria-expanded', 'true')
    await userEvent.tab()
    await expect
      .element(screen.getByRole('link', { name: 'Home', exact: true }))
      .toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.element(toggle).toHaveFocus()
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false')

    await userEvent.keyboard(' ')
    await expect
      .element(screen.getByRole('link', { name: 'Home', exact: true }))
      .toBeVisible()
    screen.getByRole('link', { name: 'Fundings' }).element().focus()
    await userEvent.tab()
    await expect
      .element(screen.getByRole('link', { name: '中文' }))
      .toHaveFocus()
    await userEvent.tab()
    await expect
      .element(screen.getByRole('button', { name: 'After navigation' }))
      .toHaveFocus()
  })

  it('keeps one expanded list at exactly 1024px with no trigger in the tab order', async () => {
    await page.viewport(1024, 800)
    const screen = await render(<NavigationFixture />)
    await expect
      .element(screen.getByRole('link', { name: 'Home', exact: true }))
      .toBeVisible()
    const trigger = screen.container.querySelector<HTMLButtonElement>(
      'button[slot="trigger"]',
    )
    await expect.element(trigger).not.toBeVisible()
    expect(trigger?.getAttribute('aria-expanded')).toBe('true')
    expect(screen.container.querySelectorAll('#nav-menu')).toHaveLength(1)
    screen.getByRole('link', { name: 'Lab' }).element().focus()
    await userEvent.tab()
    await expect
      .element(screen.getByRole('link', { name: 'Home', exact: true }))
      .toHaveFocus()
  })

  it('repairs focus at both breakpoint crossings and resets mobile state', async () => {
    await page.viewport(1023, 800)
    const screen = await render(<NavigationFixture />)
    const originalList = screen.container.querySelector('#nav-menu')
    const toggle = screen.getByRole('button', { name: labels.open })
    toggle.element().focus()
    await page.viewport(1024, 800)
    await expect
      .element(screen.getByRole('link', { name: 'Home', exact: true }))
      .toHaveFocus()
    await page.viewport(1023, 800)
    await expect.element(toggle).toHaveFocus()
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false')

    await toggle.click()
    await expect
      .element(screen.getByRole('button', { name: labels.close }))
      .toHaveAttribute('aria-expanded', 'true')
    await page.viewport(1200, 800)
    // A visible link alone also matches the still-open mobile layout.
    await expect
      .element(
        screen.container.querySelector<HTMLButtonElement>(
          'button[slot="trigger"]',
        ),
      )
      .not.toBeVisible()
    await expect
      .element(screen.getByRole('link', { name: 'Home', exact: true }))
      .toBeVisible()
    screen.getByRole('link', { name: 'People' }).element().focus()
    await page.viewport(390, 800)
    await expect.element(toggle).toHaveFocus()
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.container.querySelector('#nav-menu')).toBe(originalList)
  })

  it.each(['en', 'zh'] as const)(
    'uses localized navigation labels in %s',
    async locale => {
      const localized = translate(locale).navigation
      const screen = await render(<NavigationFixture locale={locale} />)
      await expect
        .element(screen.getByRole('navigation', { name: localized.label }))
        .toBeVisible()
      await screen.getByRole('button', { name: localized.open }).click()
      await expect
        .element(screen.getByRole('button', { name: localized.close }))
        .toBeVisible()
    },
  )

  it('closes after a native hash link without cancelling its default navigation', async () => {
    const screen = await render(<NavigationFixture />)
    await screen.getByRole('button', { name: labels.open }).click()
    await screen.getByRole('link', { name: 'News' }).click()
    await expect.poll(() => location.hash).toBe('#news')
    await expect
      .element(screen.getByRole('button', { name: labels.open }))
      .toHaveAttribute('aria-expanded', 'false')

    await screen.getByRole('button', { name: labels.open }).click()
    screen.getByRole('link', { name: 'News' }).element().focus()
    await userEvent.keyboard('{Enter}')
    await expect
      .element(screen.getByRole('button', { name: labels.open }))
      .toHaveAttribute('aria-expanded', 'false')
  })

  it.each(['Meta', 'Shift'] as const)(
    'closes without consuming a %s-modified link activation',
    async modifier => {
      const screen = await render(<NavigationFixture />)
      await screen.getByRole('button', { name: labels.open }).click()
      const events: { prevented: boolean; modified: boolean }[] = []
      // Only the test prevents opening another browser tab, after checking the island.
      const captureDefault = (event: MouseEvent) => {
        events.push({
          prevented: event.defaultPrevented,
          modified: event.getModifierState(modifier),
        })
        event.preventDefault()
      }
      document.addEventListener('click', captureDefault)
      try {
        await userEvent.keyboard(`{${modifier}>}`)
        await screen.getByRole('link', { name: 'People' }).click()
      } finally {
        document.removeEventListener('click', captureDefault)
        await userEvent.keyboard(`{/${modifier}}`)
      }
      expect(events).toEqual([{ prevented: false, modified: true }])
      await expect
        .element(screen.getByRole('button', { name: labels.open }))
        .toHaveAttribute('aria-expanded', 'false')
    },
  )

  it('does not consume a Control-modified click event', async () => {
    const screen = await render(<NavigationFixture />)
    await screen.getByRole('button', { name: labels.open }).click()
    const events: boolean[] = []
    const captureDefault = (event: MouseEvent) => {
      events.push(event.defaultPrevented)
      event.preventDefault()
    }
    document.addEventListener('click', captureDefault)
    try {
      // A real macOS Ctrl+click is a context menu, not a link activation.
      screen
        .getByRole('link', { name: 'People' })
        .element()
        .dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            ctrlKey: true,
          }),
        )
    } finally {
      document.removeEventListener('click', captureDefault)
    }
    expect(events).toEqual([false])
    await expect
      .element(screen.getByRole('button', { name: labels.open }))
      .toHaveAttribute('aria-expanded', 'false')
  })

  it('preserves middle-click behavior while closing the mobile panel', async () => {
    const screen = await render(<NavigationFixture />)
    await screen.getByRole('button', { name: labels.open }).click()
    const events: boolean[] = []
    const captureDefault = (event: MouseEvent) => {
      events.push(event.defaultPrevented)
      event.preventDefault()
    }
    document.addEventListener('auxclick', captureDefault)
    try {
      await screen
        .getByRole('link', { name: 'People' })
        .click({ button: 'middle' })
    } finally {
      document.removeEventListener('auxclick', captureDefault)
    }
    expect(events).toEqual([false])
    await expect
      .element(screen.getByRole('button', { name: labels.open }))
      .toHaveAttribute('aria-expanded', 'false')
  })
})

it('enhances late/replaced native links and location updates in a real document', async () => {
  history.replaceState(null, '', '/people/yhma/?q=1#bio')
  const screen = await render(<NavigationFixture key="first" />)
  const alternate = screen.getByRole('link', { name: '中文' })
  await expect
    .element(alternate)
    .toHaveAttribute('href', 'https://magroup.ac.cn/people/yhma/?q=1#bio')
  await expect.element(alternate).toHaveAttribute('lang', 'zh-Hans')
  await expect.element(alternate).toHaveAttribute('hreflang', 'zh-Hans')
  await expect
    .poll(() =>
      screen.container
        .querySelector('#nav-menu a[aria-current="page"]')
        ?.getAttribute('href'),
    )
    .toBe('/people')

  history.replaceState(null, '', '/publications/?year=2026#latest')
  window.dispatchEvent(new PopStateEvent('popstate'))
  await expect
    .element(alternate)
    .toHaveAttribute(
      'href',
      'https://magroup.ac.cn/publications/?year=2026#latest',
    )
  await expect
    .poll(() =>
      screen.container
        .querySelector('#nav-menu a[aria-current="page"]')
        ?.getAttribute('href'),
    )
    .toBe('/publications')

  await screen.rerender(<NavigationFixture key="replacement" />)
  await expect
    .element(alternate)
    .toHaveAttribute(
      'href',
      'https://magroup.ac.cn/publications/?year=2026#latest',
    )
  expect(
    screen.container.querySelectorAll('#nav-menu a[aria-current="page"]'),
  ).toHaveLength(1)
  history.replaceState(null, '', '/missing/#section')
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  await expect
    .element(alternate)
    .toHaveAttribute('href', 'https://magroup.ac.cn/missing/#section')
  expect(
    screen.container.querySelectorAll('#nav-menu a[aria-current]'),
  ).toHaveLength(0)
})
