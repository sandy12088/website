import type { SiteApi, SitePage } from './types.ts';



import { feedHandler } from '../routes/feed.ts';
import { robotsHandler } from '../routes/robots.ts';
import { sitemapHandler } from '../routes/sitemap.ts';
import { NotFound } from '../shell/not-found.tsx';
import {
  EventsDetail,
  EventsList,
  FundingsDetail,
  FundingsList,
  HomePage,
  LandingPage,
  PeopleDetail,
  PeopleList,
  PublicationsDetail,
  PublicationsList,
  StandalonePage,
} from '../views/index.ts'

/**
 * The routes both sites publish, declared once.
 *
 * Every entry names the languages that serve it, which is the whole point of the
 * table: the two apps used to carry the same fourteen route files and could drift
 * apart without saying so. A route that only one language should serve lists only
 * that language, and the registrar will refuse to build it for the other; a route
 * that needs a different component or param set per language is written as two
 * entries with disjoint `locales`.
 *
 * The paths are the ones the previous Hugo build published, and the components
 * read their language from `siteContext()`, so one entry serves both sites.
 *
 * Order matters: `/[...slugs]` is last because it claims only the paths the
 * entries above it have not.
 */
export const sitePages = [
  { component: HomePage, locales: ['zh', 'en'], path: '/' },
  { component: NotFound, locales: ['zh', 'en'], path: '/404' },

  { component: PeopleList, locales: ['zh', 'en'], path: '/people' },
  {
    component: PeopleDetail,
    locales: ['zh', 'en'],
    path: '/people/[...slugs]',
    staticParams: ({ source }) => source.authorParams(),
  },

  { component: PublicationsList, locales: ['zh', 'en'], path: '/publications' },
  { component: PublicationsList, locales: ['zh', 'en'], path: '/publication' },
  {
    component: PublicationsDetail,
    locales: ['zh', 'en'],
    path: '/publication/[...slugs]',
    staticParams: ({ source }) => source.publicationParams(),
  },

  { component: FundingsList, locales: ['zh', 'en'], path: '/fundings' },
  { component: FundingsList, locales: ['zh', 'en'], path: '/funding' },
  {
    component: FundingsDetail,
    locales: ['zh', 'en'],
    path: '/funding/[...slugs]',
    staticParams: ({ source }) => source.fundingParams(),
  },

  { component: EventsList, locales: ['zh', 'en'], path: '/event' },
  {
    component: EventsDetail,
    locales: ['zh', 'en'],
    path: '/event/[...slugs]',
    staticParams: ({ source }) => source.eventParams(),
  },

  {
    component: StandalonePage,
    locales: ['zh', 'en'],
    path: '/[...slugs]',
    /**
     * `/privacy/`, `/terms/` and any other entry of the `pages` collection,
     * minus the ones the entries above already serve — `/publications/` and
     * `/fundings/` are routes of their own, and one path twice is a build error.
     */
    staticParams: ({ source }, claimed) =>
      source.pageParams().filter(slugs => !claimed.has(`/${slugs.join('/')}`)),
  },
] as const satisfies readonly SitePage[]

/**
 * The documents published at fixed paths: the feed and the two crawler files.
 *
 * They are routes rather than files in `public/` so their host cannot drift from
 * the site's `baseUrl`.
 */
export const siteApis = [
  {
    handler: ({ site, source }) => feedHandler(site, source),
    locales: ['zh', 'en'],
    path: '/index.xml',
  },
  {
    handler: ({ site }) => robotsHandler(site),
    locales: ['zh', 'en'],
    path: '/robots.txt',
  },
  {
    handler: ({ site, source }) => sitemapHandler(site, source),
    locales: ['zh', 'en'],
    path: '/sitemap.xml',
  },
] as const satisfies readonly SiteApi[]

/** A path with no wildcard or segment: the concrete URLs an app can navigate to. */
type ConcretePath<Path extends string> = Path extends `${string}[${string}`
  ? never
  : Path

/**
 * The paths the shared table serves without params.
 *
 * An app declares `RouteConfig.paths` with this, which is what Waku's
 * file-router typegen used to generate. The parameterised routes
 * (`/people/[...slugs]` and the other archives) are absent on purpose: their
 * concrete URLs are the content's, so they are strings rather than a union.
 */
export type SharedPaths = ConcretePath<(typeof sitePages)[number]['path']>