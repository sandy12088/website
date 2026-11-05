#!/usr/bin/env node
// Run `pnpm dev` first. This checks Waku's real dev environments, not a static server.
import assert from 'node:assert/strict'

import { chromium } from 'playwright'

// Set DEV_HOST to a LAN IP to cover HTTP origins without native randomUUID.
const host = process.env['DEV_HOST'] || 'localhost'
const sites = [
  {
    origin: `http://${host}:3000`,
    other: 'https://magroup.ac.cn',
    title: 'Yuhan Ma',
    open: 'Open navigation',
    close: 'Close navigation',
    dark: 'Switch to dark appearance',
    light: 'Switch to light appearance',
  },
  {
    origin: `http://${host}:3001`,
    other: 'https://yhmayyds.group',
    title: '马宇翰研究组',
    open: '展开导航',
    close: '收起导航',
    dark: '切换为深色外观',
    light: '切换为浅色外观',
  },
]
const routes = [
  '/',
  '/people/',
  '/publication/2017-ma-quantum-thermodynamic-cycle/?q=1#abstract',
  '/event/2019-08/',
]
const browser = await chromium.launch()
try {
  for (const site of sites) {
    const context = await browser.newContext({
      colorScheme: 'light',
      viewport: { width: 1280, height: 900 },
    })
    try {
      const page = await context.newPage()
      page.setDefaultTimeout(60_000)
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text())
      })
      page.on('response', response => {
        if (response.status() >= 400) {
          errors.push(`${response.status()} ${response.url()}`)
        }
      })

      // A 200 shell alone cannot prove an SSR-disabled page can load its RSC data.
      const rsc = await page.request.get(`${site.origin}/RSC/R/_root.txt`)
      assert.equal(rsc.status(), 200, `${site.origin}: root RSC request`)
      const payload = await rsc.text()
      assert.ok(
        payload.includes(site.title),
        `${site.origin}: root RSC content`,
      )
      assert.doesNotMatch(payload, /^[\da-f]+:E\{/m, 'RSC error record')

      for (const route of routes) {
        const response = await page.goto(site.origin + route, {
          waitUntil: 'networkidle',
        })
        assert.equal(response.status(), 200, site.origin + route)
        const html = await response.text()
        assert.match(
          html,
          /\/@id\/.*virtual:vite-rsc\/entry-browser/,
          'Expected a Waku dev document; start both sites with pnpm dev',
        )
        assert.doesNotMatch(html, /<nav[\s>]/, 'Keep SSR disabled')
        await page.locator('#nav-menu').waitFor({ state: 'visible' })
        assert.equal(
          await page.locator('[data-alt-site]').getAttribute('href'),
          site.other + route,
        )
        assert.equal(await page.locator('vite-error-overlay').count(), 0)
        console.log(`PASS ${site.origin}${route}`)
      }

      // Exercise client React and compiled StyleX, not just server compilation.
      await page.getByRole('button', { name: site.dark, exact: true }).click()
      await page
        .getByRole('button', { name: site.light, exact: true })
        .waitFor()
      await page.waitForFunction(
        () =>
          document.documentElement.dataset.theme === 'dark' &&
          getComputedStyle(document.querySelector('body > div'))
            .backgroundColor === 'rgb(12, 17, 22)',
      )
      await page.setViewportSize({ width: 390, height: 844 })
      const toggle = page.getByRole('button', { name: site.open, exact: true })
      await toggle.press('Enter')
      await page
        .getByRole('button', { name: site.close, exact: true })
        .waitFor()
      await page.locator('#nav-menu a').first().focus()
      await page.keyboard.press('Escape')
      await toggle.waitFor()
      assert.equal(
        await toggle.evaluate(node => node === document.activeElement),
        true,
      )
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false')

      // Waku also loads its HTML renderer for missing URLs during development.
      const missing = await page.request.get(
        `${site.origin}/__dev_smoke_missing__/`,
      )
      assert.equal(missing.status(), 404)
      assert.doesNotMatch(
        await missing.text(),
        /Invalid hook call|Cannot read properties of null|Switched to client rendering/,
      )
      assert.deepEqual(errors, [], `${site.origin}: browser errors`)
      console.log(`PASS ${site.origin}: theme, mobile keyboard navigation, 404`)
    } finally {
      await context.close()
    }
  }
} finally {
  await browser.close()
}