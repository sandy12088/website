import type { UserOptions } from '@stylexjs/unplugin'
import type { Plugin, PluginOption } from 'vite'
import type { Config } from 'waku/config'

import path from 'node:path'

import babelPlugin from '@rolldown/plugin-babel'
import stylex from '@stylexjs/unplugin'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import browserslist from 'browserslist'
import { fumadocsMdx } from 'fumadocs-mdx/vite'
import { browserslistToTargets } from 'lightningcss'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import { defineConfig } from 'waku/config'

import { contentAssets } from './content-assets.ts'
import { contentOverlays } from './content-overlays.ts'
import { navigationBootstrap, themeBootstrap } from './shell/bootstrap.ts'

/**
 * Build configuration shared by the two sites.
 *
 * Waku takes its root from `process.cwd()`, so each app runs this factory with
 * its own directory as cwd and the only absolute paths here are the two shared
 * trees at the repository root: `content/` and `public/`.
 */

/**
 * Front matter carries LaTeX (`$\phi^{4}$`), which the old Hugo build rendered
 * with KaTeX at build time. Fumadocs compiles the same way: `remark-math` turns
 * `$...$` into math nodes and `rehype-katex` renders them to static HTML, so no
 * runtime math renderer is shipped.
 */
const mdxOptions = {
  rehypePlugins: [rehypeKatex],
  remarkPlugins: [remarkMath],
}

const stylexOptions: Partial<UserOptions> = {
  useCSSLayers: true,
  devMode: 'full',
  devPersistToDisk: true,
  runtimeInjection: false,
  treeshakeCompensation: true,
  // Preserve modern media features used by the component package.
  enableMediaQueryOrder: false,
  lightningcssOptions: {
    minify: process.env['NODE_ENV'] !== 'development',
    targets: browserslistToTargets(browserslist('>= 5%')),
  },
}

/** `<repo>`, one level above `sites/<name>/` and `packages/<name>/`. */
function repoRoot(): string {
  return path.resolve(process.cwd(), '../..')
}

/**
 * Watch the shared content tree.
 *
 * Vite watches the project root and any file it has already loaded, so the
 * modules in `.source/` keep working. Watching `content/` up front additionally
 * catches *new* files, which fumadocs-mdx's index-file plugin needs in order to
 * regenerate `.source/` during development.
 */
function sharedContentWatcher(): Plugin {
  return {
    configureServer(server) {
      server.watcher.add(path.join(repoRoot(), 'content'))
    },
    name: 'yhma:watch-shared-content',
  }
}

/**
 * The two tags `@stylexjs/unplugin` injects in dev mode: its stylesheet
 * endpoint and the module that keeps a `<style>` element in sync with it.
 *
 * The shell module holds its markup in a `export default "…"` literal, so the
 * tags are quoted the way `JSON.stringify` quotes them.
 */
const stylexDevTags = JSON.stringify(
  [
    '<link rel="stylesheet" href="/virtual:stylex.css">',
    '<script type="module" src="/@id/virtual:stylex:runtime"></script>',
  ].join(''),
).slice(1, -1)

const bootstrapTags = JSON.stringify(
  `<script>${themeBootstrap};${navigationBootstrap}</script>`,
).slice(1, -1)

/**
 * Enhance the actual document, not inert script tags mounted later through RSC.
 *
 * Every route disables SSR. Waku's fallback HTML reaches Vite as a module with a
 * string default export, bypassing transformIndexHtml. Inject the theme and link
 * bootstrap here in both dev and production; its observer handles late RSC links.
 * Dev also needs StyleX's virtual stylesheet/runtime. Production extracts CSS.
 */
function documentShell(): Plugin {
  let isDev = false
  return {
    name: 'yhma:document-shell',
    configResolved(config) {
      isDev = config.command === 'serve'
    },
    transform(code, id) {
      if (!id.includes('virtual:vite-rsc-waku/html-shell')) {
        return
      }
      const bodyEnd = code.indexOf('</body>')
      if (bodyEnd === -1) {
        return
      }
      return {
        code:
          code.slice(0, bodyEnd) +
          bootstrapTags +
          (isDev ? stylexDevTags : '') +
          code.slice(bodyEnd),
        map: null,
      }
    },
  }
}

export function createWakuConfig(): Config {
  return defineConfig({
    vite: {
      environments: {
        rsc: {
          // Keep Waku's RSDW imports inside Vite so its patches and react-server
          // condition apply. Native Node loading in dev would use ordinary React.
          resolve: { noExternal: ['react-server-dom-webpack'] },
        },
      },
      plugins: [
        // StyleX must compile in every environment (client, ssr, rsc) so that
        // server components can call `stylex.props()` without a client boundary.
        stylex.vite(stylexOptions) as PluginOption,
        // The macro API is enabled so `defineDocs`/`defineCollections` calls in
        // `source.config.ts` are statically evaluated instead of run at runtime.
        contentOverlays(path.join(repoRoot(), 'content')),
        fumadocsMdx({ globalOptions: { mdxOptions } }),
        babelPlugin({ presets: [reactCompilerPreset()] }),
        react(),
        sharedContentWatcher(),
        contentAssets(path.join(repoRoot(), 'content')),
        documentShell(),
      ],
      // Only site-wide assets live here; bundle resources come from content/.
      publicDir: path.join(repoRoot(), 'public'),
      resolve: { dedupe: ['waku'], tsconfigPaths: true },
      server: {
        fs: {
          // The content tree and the shared assets live outside the app root.
          allow: [repoRoot()],
        },
      },
    },
  })
}
