import * as stylex from '@stylexjs/stylex'
import { unstable_notFound } from 'waku/router/server'

import { getMdxComponents } from '../../components/mdx.tsx'
import { shared } from '../../components/views.stylex.ts'
import { siteContext } from '../../site-context.ts'

/**
 * A standalone page from the `pages` collection, e.g. `/privacy/` or `/terms/`.
 *
 * The component owns the article layout; MDX supplies only the page content.
 * A page the source does not know about is a 404 rather than an empty document,
 * so a translation that never got imported fails the build instead of publishing
 * a blank page.
 */
export function StandalonePage({ slugs = [] }: { slugs?: string[] }) {
  const { source } = siteContext()
  const page = source.findPage(slugs)
  if (!page) unstable_notFound()

  const MDX = page.data.body

  return (
    <div {...stylex.props(shared.page)}>
      <header {...stylex.props(shared.header)}>
        <h1 {...stylex.props(shared.title)}>{page.data.title}</h1>
      </header>
      <div {...stylex.props(shared.reading)}>
        <div {...stylex.props(shared.body)}>
          <MDX components={getMdxComponents()} />
        </div>
      </div>
    </div>
  )
}
