import type { CreatedPage, RouteAuthorFns } from '../router/types.ts'
import type { SiteContextValue } from '../site-context.ts'
import type { Locale } from '../site/types.ts'

import { describe, expect, it, vi } from 'vitest'

import { createFileRoutes, routePathForFile } from '../router/file-routes.ts'
import { assertRouteServes, createSharedRoutes } from '../router/register.ts'
import { siteApis, sitePages } from '../router/shared-routes.ts'

/**
 * The route table names the real views, and a view imports StyleX modules that
 * only the bundler can compile — `stylex.defineMarker()` throws in Node, so the
 * table cannot be loaded as is. These cases inspect registration and never
 * render, so the views are stubbed; the table, the paths and the params under
 * test are the real ones.
 */
vi.mock('../router/document.tsx', () => ({
  SiteLayout: () => null,
  SiteRoot: () => null,
}))
vi.mock('../shell/not-found.tsx', () => ({ NotFound: () => null }))
vi.mock('../views/index.ts', () => ({
  EventsDetail: () => null,
  EventsList: () => null,
  FundingsDetail: () => null,
  FundingsList: () => null,
  HomePage: () => null,
  PeopleDetail: () => null,
  PeopleList: () => null,
  PublicationsDetail: () => null,
  PublicationsList: () => null,
  StandalonePage: () => null,
}))

/**
 * The router's own contract.
 *
 * The two apps used to carry the same fourteen route files, so "the sites
 * publish the same URLs" was a property of two file trees that nothing enforced
 * until after a build. These cases assert it on the table instead, plus the
 * language gate, the catch-all's exclusion rule and the site file conventions.
 */

const LOCALES: readonly Locale[] = ['zh', 'en']
const CATCH_ALL = '/[...slugs]'

/** Enough of a site for the document factories; nothing here renders or responds. */
function fakeSite(locale: Locale) {
  return {
    alternate: {
      baseUrl: 'https://example.com',
      label: 'English',
      locale: 'en',
    },
    baseUrl: 'https://example.com',
    languageCode: locale === 'zh' ? 'zh-Hans' : 'en-US',
    locale,
    orgName: 'Example',
    title: 'Example',
  }
}

/** The accessors the table reads; nothing here renders, so nothing else is needed. */
function fakeContext(
  locale: Locale,
  pages: readonly (readonly string[])[] = [['privacy'], ['terms']],
): SiteContextValue {
  return {
    locale,
    site: fakeSite(locale),
    source: {
      authorParams: () => [['yhma']],
      eventParams: () => [],
      fundingParams: () => [],
      pageParams: () => pages.map(slugs => [...slugs]),
      publicationParams: () => [['2024-zhai']],
    },
  } as unknown as SiteContextValue
}

interface Registered {
  apis: { method?: string; path: string; render?: string }[]
  pageInputs: CreatedPage[]
  layoutPaths: string[]
  roots: number
}

/** The subset of Waku's authoring API the registrar uses, recorded. */
function stubFns(registered: Registered): RouteAuthorFns {
  return {
    createApi: (api: { method?: string; path: string; render?: string }) => {
      registered.apis.push(api)
    },
    createLayout: (layout: { path: string }) => {
      registered.layoutPaths.push(layout.path)
    },
    createPage: (page: CreatedPage) => {
      registered.pageInputs.push(page)
      return page
    },
    createRoot: () => {
      registered.roots += 1
    },
  } as unknown as RouteAuthorFns
}

function register(
  locale: Locale = 'en',
  pages?: readonly (readonly string[])[],
) {
  const registered: Registered = {
    apis: [],
    layoutPaths: [],
    pageInputs: [],
    roots: 0,
  }
  const fns = stubFns(registered)
  const shared = createSharedRoutes(fns, fakeContext(locale, pages))
  return { fns, registered, shared }
}

/** Paths served in one language, as a sorted list. */
function pathsFor(locale: Locale): string[] {
  return [...sitePages, ...siteApis]
    .filter(entry => entry.locales.includes(locale))
    .map(entry => entry.path)
    .sort()
}

describe('shared route table', () => {
  it('names the languages of every route', () => {
    for (const entry of [...sitePages, ...siteApis]) {
      expect(entry.locales.length).toBeGreaterThan(0)
    }
  })

  it('serves every path in at most one entry per language', () => {
    for (const locale of LOCALES) {
      const paths = pathsFor(locale)
      expect(new Set(paths).size).toBe(paths.length)
    }
  })

  it('serves the same paths in both languages', () => {
    // The language switch mirrors the current path onto the other site, so a
    // path only one language serves is a broken link. Relax this expectation —
    // and the switch's fallback — when the two languages deliberately diverge.
    expect(pathsFor('en')).toEqual(pathsFor('zh'))
  })

  it('keeps the catch-all last, so it can leave claimed paths alone', () => {
    expect(sitePages.at(-1)?.path).toBe(CATCH_ALL)
    expect(sitePages.filter(page => page.path === CATCH_ALL)).toHaveLength(1)
  })

  it('refuses a language a route does not declare', () => {
    expect(() => {
      assertRouteServes({ locales: ['en'], path: '/english-only' }, 'zh')
    }).toThrow(/is not served in "zh"/)
    expect(() => {
      assertRouteServes({ locales: ['zh', 'en'], path: '/both' }, 'zh')
    }).not.toThrow()
  })
})

describe('createSharedRoutes', () => {
  it('registers the document, the frame and every route for one language', () => {
    const { registered, shared } = register('en')

    expect(registered.roots).toBe(1)
    expect(registered.layoutPaths).toEqual(['/'])
    expect(shared.pages).toHaveLength(sitePages.length)
    expect(registered.apis).toHaveLength(siteApis.length)
    expect(shared.locale).toBe('en')
  })

  it('stamps the language and the rendering policy on every page', () => {
    const { registered } = register('zh')

    for (const page of registered.pageInputs) {
      expect(page.locale).toBe('zh')
      expect(page).toMatchObject({
        render: 'static',
        unstable_disableSSR: true,
      })
    }
  })

  it('registers only the routes the language serves', () => {
    // Every entry serves both languages today; the gate is what makes a
    // language-only entry possible without touching the other app.
    const { shared } = register('zh')
    expect(shared.patterns.has(CATCH_ALL)).toBe(true)
  })

  it('leaves the paths other routes own to the catch-all', () => {
    const { registered } = register('en', [
      [],
      ['privacy'],
      ['publications'],
      ['fundings'],
    ])
    const catchAll = registered.pageInputs.find(page => page.path === CATCH_ALL)

    expect(catchAll?.staticPaths).toEqual([['privacy']])
  })

  it('registers the feed and the crawler files as static GET APIs', () => {
    const { registered } = register('en')

    expect(registered.apis.map(api => api.path).sort()).toEqual([
      '/index.xml',
      '/robots.txt',
      '/sitemap.xml',
    ])
    for (const api of registered.apis) {
      expect(api).toMatchObject({ method: 'GET', render: 'static' })
    }
  })
})

describe('routePathForFile', () => {
  it('maps the file conventions to paths', () => {
    expect(routePathForFile('./pages/index.tsx')).toBe('/')
    expect(routePathForFile('./pages/join-us.tsx')).toBe('/join-us')
    expect(routePathForFile('./pages/blog/index.tsx')).toBe('/blog')
    expect(routePathForFile('./pages/blog/2024/post.tsx')).toBe(
      '/blog/2024/post',
    )
    expect(routePathForFile('./pages/[...slugs].tsx')).toBe('/[...slugs]')
  })

  it('ignores reserved, co-located and non-route files', () => {
    expect(routePathForFile('./pages/README.md')).toBeUndefined()
    expect(routePathForFile('./pages/_components/button.tsx')).toBeUndefined()
    expect(routePathForFile('./pages/_draft.tsx')).toBeUndefined()
    expect(routePathForFile('./pages/.hidden.tsx')).toBeUndefined()
  })
})

describe('createFileRoutes', () => {
  const { fns, shared } = register('en')

  const page = { default: () => null }

  it('creates a site route in the shared table’s language', () => {
    const pages = createFileRoutes(fns, { './pages/join-us.tsx': page }, shared)

    expect(pages).toMatchObject([
      {
        locale: 'en',
        path: '/join-us',
        render: 'static',
        unstable_disableSSR: true,
      },
    ])
  })

  it('ignores keys that are not route files', () => {
    expect(
      createFileRoutes(
        fns,
        {
          './pages/README.md': { default: undefined },
          './pages/_x.tsx': { default: undefined },
        },
        shared,
      ),
    ).toEqual([])
  })

  it('refuses to take a path the shared table serves', () => {
    expect(() =>
      createFileRoutes(fns, { './pages/people/index.tsx': page }, shared),
    ).toThrow(/already served by the shared route table/)
  })

  it('refuses two files claiming one path', () => {
    expect(() =>
      createFileRoutes(
        fns,
        { './pages/blog.tsx': page, './pages/blog/index.tsx': page },
        shared,
      ),
    ).toThrow(/claimed by both/)
  })

  it('requires the component and the params a wildcard needs', () => {
    expect(() =>
      createFileRoutes(fns, { './pages/join-us.tsx': {} }, shared),
    ).toThrow(/default-export/)

    expect(() =>
      createFileRoutes(fns, { './pages/blog/[...slugs].tsx': page }, shared),
    ).toThrow(/staticPaths/)

    expect(() =>
      createFileRoutes(
        fns,
        { './pages/join-us.tsx': { ...page, staticPaths: ['a'] } },
        shared,
      ),
    ).toThrow(/no wildcard/)
  })

  it('prerenders a wildcard from the module’s params', () => {
    const pages = createFileRoutes(
      fns,
      {
        './pages/blog/[...slugs].tsx': {
          default: () => null,
          staticPaths: [['2024'], ['2025']],
        },
      },
      shared,
    )

    expect(pages).toMatchObject([
      {
        locale: 'en',
        path: '/blog/[...slugs]',
        render: 'static',
        staticPaths: [['2024'], ['2025']],
        unstable_disableSSR: true,
      },
    ])
  })
})
