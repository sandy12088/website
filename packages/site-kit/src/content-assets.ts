import type { Plugin } from 'vite'

import { glob, readFile, realpath } from 'node:fs/promises'
import path from 'node:path'

const mediaTypes: Record<string, string> = {
  '.bib': 'application/x-bibtex',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

function assetType(file: string): string | undefined {
  const parts = file.split('/')
  if (
    parts.length < 3 ||
    !['authors', 'publications'].includes(parts[0] ?? '') ||
    parts.some(
      part => part.length === 0 || part.startsWith('.') || part.includes('\\'),
    )
  )
    return undefined
  return mediaTypes[path.extname(file).toLowerCase()]
}

/** Publish bundle resources at their content-relative URLs, never the MDX sources. */
export function contentAssets(contentRoot: string): Plugin {
  return {
    name: 'yhma:content-assets',
    async configureServer(server) {
      const canonicalRoot = await realpath(contentRoot)
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          next()
          return
        }
        let file: string
        try {
          file = decodeURIComponent((req.url ?? '').split('?')[0] ?? '').slice(
            1,
          )
        } catch {
          res.statusCode = 400
          res.end()
          return
        }
        const type = assetType(file)
        if (type === undefined) {
          next()
          return
        }
        void realpath(path.join(contentRoot, file))
          .then(async resolved => {
            if (!resolved.startsWith(`${canonicalRoot}${path.sep}`)) {
              res.statusCode = 404
              res.end()
              return
            }
            const body = await readFile(resolved)
            res.setHeader('Content-Type', type)
            res.setHeader('Content-Length', body.length)
            res.setHeader('Cache-Control', 'no-cache')
            res.end(req.method === 'HEAD' ? undefined : body)
          })
          .catch((error: unknown) => {
            if (
              error instanceof Error &&
              'code' in error &&
              (error.code === 'ENOENT' || error.code === 'ENOTDIR')
            ) {
              res.statusCode = 404
              res.end()
            } else next(error)
          })
      })
    },
    async generateBundle() {
      // Waku builds client, SSR and RSC environments; only client is public.
      if (this.environment.name !== 'client') return
      for await (const file of glob('**/*', {
        cwd: contentRoot,
        withFileTypes: true,
      })) {
        if (!file.isFile()) continue
        const relative = path.relative(
          contentRoot,
          path.join(file.parentPath, file.name),
        )
        if (assetType(relative) === undefined) continue
        this.emitFile({
          type: 'asset',
          fileName: relative,
          source: await readFile(path.join(contentRoot, relative)),
        })
      }
    },
  }
}
