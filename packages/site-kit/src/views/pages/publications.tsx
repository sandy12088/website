import * as stylex from '@stylexjs/stylex'

import { styles as blockStyles } from '../../components/block.stylex.ts'
import { BlockHeading } from '../../components/block.tsx'
import { PublicationList } from '../../components/citation.tsx'
import { shared } from '../../components/views.stylex.ts'
import { siteContext } from '../../site-context.ts'
import { PublicationDetail } from './publication-detail.tsx'

/**
 * `/publications/`.
 *
 * The heading and description come from `content/pages/publications/index.mdx`.
 * This component owns the layout. The archive is the shared year-grouped
 * index, with `h2` year headings because the page owns the only `h1`.
 */
export function PublicationsList() {
  const { source } = siteContext()
  const frontMatter = source.findPage(['publications'])
  const heading =
    frontMatter === undefined ? 'Publications' : frontMatter.data.title
  const intro = frontMatter?.data.description

  return (
    <div {...stylex.props(shared.page)}>
      <div {...stylex.props(blockStyles.measure)}>
        <BlockHeading as="h1" subtitle={intro} title={heading} />
        <PublicationList items={source.sortedPublications()} yearAs="h2" />
      </div>
    </div>
  )
}

export function PublicationsDetail({ slugs = [] }: { slugs?: string[] }) {
  const { source } = siteContext()
  const page = source.findPublication(slugs)
  if (!page) return null
  return <PublicationDetail page={page} />
}
