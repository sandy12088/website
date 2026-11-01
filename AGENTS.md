# Website for BNU yhma Research Group

学术小组的主页：两个独立站点 + 一个共享包。

| 站点   | 目录                     | 语言 | Origin                 |
| ------ | ------------------------ | ---- | ---------------------- |
| 英文站 | `sites/yhma-yyds-group/` | `en` | https://yhmayyds.group |
| 中文站 | `sites/magroup-ac-cn/`   | `zh` | https://magroup.ac.cn  |

## Stack

- pnpm 12+ workspaces (`packages/*`, `sites/*`)
- TypeScript
- React 19
- Waku for SSG (`render: 'static'` everywhere; output in each site's `dist/public`)
- fumadocs-mdx for Content Management (collections + zod front-matter schemas)
- StyleX for styling React components

## Quick start

Requires Node.js >=26.12.0 and pnpm 12+ (see the package engines).

```bash
pnpm install
pnpm dev          # both dev servers: :3000 English, :3001 Chinese
pnpm typegen      # .source/ per site
pnpm typecheck
pnpm lint
pnpm test
pnpm format
```

Read [development guide](./docs-dev/README.md) for more information.

## Conventions

- **Routes are declared once.** `packages/site-kit/src/router/` holds the route table both
  sites publish: one entry per route, naming the languages that serve it (`locales`) and
  the view that renders it. `createSharedRoutes()` registers it through Waku's
  config-based API (`createPage`/`createLayout`/`createRoot`/`createApi`) for one language
  and stamps that language on every page it creates; `createFileRoutes()` adds the routes
  a single site owns from its own `src/pages/`. A route one language does not serve is an
  entry with narrower `locales`, not a file that exists in one app only.
- **The apps differ only in configuration.** Each site has one `src/site.config.ts`
  (identity: origin, locale, menu language, the paired site) and one `src/lib/source.ts`
  (the generated collections handed to the kit). `src/lib/site-context.ts` defines both
  once at module load; `src/waku.server.tsx` imports it before registering any route, so
  every shared component below reads the site with `siteContext()`.
- **Content shape is a schema.** `packages/site-kit/src/content/schemas.ts` is the single
  source of truth; `packages/site-kit/src/content/collections.ts` registers the
  collections and `pnpm test` validates the front matter against the same schemas.
- **One content tree, two languages.** `content/` belongs to the repository, not to a
  site: `index.md(x)` is the default, with optional `index.en.md(x)` / `index.zh.md(x)`
  overlays. Front matter merges recursively before schema defaults; arrays replace.
  Missing localized fields/body inherit the default, never the other language.
  The collection globs must match all names or an overlay is never imported.
- **Styling is StyleX only.** No Tailwind, no handwritten CSS except
  `packages/site-kit/src/styles/global.css` (the self-hosted font faces, the document
  palette, `color-scheme`, the nav current-page marker and the KaTeX overflow guard) and
  the vendored KaTeX stylesheet. Two compiler constraints to respect:
  - conditional (e.g. dark-mode) values must be inline literals, because an imported
    constant binds as a StyleX value object and fails condition validation;
  - media queries must be literal `'@media (...)'` keys, for the same reason.
    See `packages/site-kit/src/styles/tokens.stylex.ts` and `README.md#styles`.
- **One shared design system.** Source Serif 4 (editorial voice) and Inter (interface) are
  self-hosted variable Latin subsets under `packages/site-kit/src/styles/fonts/` (SIL OFL);
  CJK falls back to platform faces. Every colour, radius and motion value comes from
  `tokens.stylex.ts`, and the dark half of each colour pair stays inline at its call site.
  The shared visual grammar is the page edge (`WIDTH.page`) with left-aligned reading
  measures, a single cobalt accent for interactive elements, hairlines instead of card
  borders, and one entrance animation (the home hero). Design notes live in
  [docs-dev/README.md](./docs-dev/README.md#design-system).
- **Generated files are not edited.** Each site generates its own `.source/`;
  `packages/site-kit/src/components/icon-data.ts` comes from
  `scripts/generate-icon-data.mjs`.

## Rendering policy

Every route is `render: 'static'`, so each site is a pure static export: no server runtime
is needed and its `dist/public` is the publish directory. Waku does not pass the request
path to a layout, so the document bootstrap owns active navigation and the language
switch href. It also observes late-mounted/replaced navigation after the RSC payload
arrives. Interactive controls use React Aria; navigation links remain native server
components. Keep the current SSR-disabled fallback-shell policy unchanged.
