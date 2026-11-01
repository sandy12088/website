import * as stylex from '@stylexjs/stylex'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'

import { ThemeToggle } from '../components/theme-toggle.tsx'
import { translate } from '../content/strings.ts'
import { frameStyles } from '../styles/frame.stylex.ts'
import { themeMarker } from '../styles/tokens.stylex.ts'

const html = document.documentElement
const initialClassName = html.className
const initialTheme = html.dataset['theme']

beforeEach(() => {
  html.className = stylex.props(themeMarker).className ?? ''
  html.dataset['theme'] = 'light'
  localStorage.removeItem('theme')
})

afterEach(() => {
  html.className = initialClassName
  if (initialTheme === undefined) delete html.dataset['theme']
  else html.dataset['theme'] = initialTheme
  localStorage.removeItem('theme')
})

test.each(['en', 'zh'] as const)(
  'toggles with localized names (%s), keyboard and storage',
  async locale => {
    const labels = translate(locale).appearance
    const screen = await render(<ThemeToggle labels={labels} />)
    const button = screen.getByRole('button', { name: labels.toDark })
    await expect.element(button).toHaveAttribute('accesskey', 't')
    await expect.element(button).toHaveAttribute('title', labels.label)
    await button.click()
    await expect
      .element(screen.getByRole('button', { name: labels.toLight }))
      .toBeVisible()
    expect(html.dataset['theme']).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')

    await userEvent.keyboard('{Enter}')
    await expect
      .element(screen.getByRole('button', { name: labels.toDark }))
      .toBeVisible()
    expect(localStorage.getItem('theme')).toBe('light')
    await userEvent.keyboard(' ')
    await expect
      .element(screen.getByRole('button', { name: labels.toLight }))
      .toBeVisible()
  },
)

test('tracks external theme changes and applies dark selectors from the html marker', async () => {
  const labels = translate('en').appearance
  const screen = await render(
    <div data-testid="frame" {...stylex.props(frameStyles.shell)}>
      <ThemeToggle labels={labels} />
    </div>,
  )
  const frame = screen.getByTestId('frame')
  const light = getComputedStyle(frame.element()).backgroundColor
  html.dataset['theme'] = 'dark'
  await expect
    .element(screen.getByRole('button', { name: labels.toLight }))
    .toBeVisible()
  await expect
    .poll(() => getComputedStyle(frame.element()).backgroundColor)
    .toBe('rgb(12, 17, 22)')
  expect(getComputedStyle(frame.element()).backgroundColor).not.toBe(light)
  await screen.getByRole('button', { name: labels.toLight }).click()
  await expect
    .poll(() => getComputedStyle(frame.element()).backgroundColor)
    .toBe(light)
})

test('still changes the in-memory theme when storage writes fail', async () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Storage unavailable', 'SecurityError')
  })
  const labels = translate('zh').appearance
  const screen = await render(<ThemeToggle labels={labels} />)
  await screen.getByRole('button', { name: labels.toDark }).click()
  await expect
    .element(screen.getByRole('button', { name: labels.toLight }))
    .toBeVisible()
  expect(html.dataset['theme']).toBe('dark')
})
