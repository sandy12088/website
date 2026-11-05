import * as stylex from '@stylexjs/stylex'

import { BackLink } from '../../components/back-link.tsx'
import { styles as blockStyles } from '../../components/block.stylex.ts'
import { BlockHeading } from '../../components/block.tsx'
import { DetailRow, FundingCard } from '../../components/cards.tsx'
import { MathText } from '../../components/math-text.tsx'
import { getMdxComponents } from '../../components/mdx.tsx'
import { Attachments } from '../../components/view-links.tsx'
import { card as cardStyles, shared } from '../../components/views.stylex.ts'
import { formatDate } from '../../content/format.ts'
import { translate } from '../../content/strings.ts'
import { siteContext } from '../../site-context.ts'
import { navFor } from '../../site/nav.ts'

/** `/fundings/`: funded projects as the system's card grid. */
export function FundingsList() {
  const { source } = siteContext()
  const frontMatter = source.findPage(['fundings'])
  const heading =
    frontMatter === undefined ? 'Fundings' : frontMatter.data.title

  return (
    <div {...stylex.props(shared.page)}>
      <div {...stylex.props(blockStyles.measure)}>
        <BlockHeading as="h1" title={heading} />
        <div {...stylex.props(cardStyles.grid)}>
          {source.sortedFundings().map(page => (
            <FundingCard key={page.url} page={page} />
          ))}
        </div>
      </div>
    </div>
  )
}

/** `/funding/<slug>/`: one project, with its summary and Markdown body. */
export function FundingsDetail({ slugs = [] }: { slugs?: string[] }) {
  const { locale, source } = siteContext()
  const page = source.findFunding(slugs)
  if (!page) return null
  const labels = translate(locale)
  const MDX = page.data.body
  const backLabel =
    navFor(locale).find(item => item.to === '/fundings')?.label ?? 'Fundings'

  return (
    <div {...stylex.props(shared.page)}>
      <BackLink href="/fundings/">{backLabel}</BackLink>
      <header {...stylex.props(shared.header)}>
        <h1 {...stylex.props(shared.title)}>{page.data.title}</h1>
        <div {...stylex.props(shared.meta)}>
          <div {...stylex.props(shared.metaInline)}>
            <time dateTime={page.data.date_start}>
              {formatDate(page.data.date_start)}
            </time>
          </div>
        </div>
        <div {...stylex.props(shared.actions)}>
          <Attachments
            includeCite={false}
            labels={labels.buttons}
            size="large"
            source={{ ...page.data, links: [], slugs: page.slugs }}
          />
        </div>
      </header>

      <div {...stylex.props(shared.reading)}>
        {page.data.program.length > 0 ? (
          <DetailRow label={labels.summary}>
            <MathText text={page.data.program} />
          </DetailRow>
        ) : null}
        <div {...stylex.props(shared.body)}>
          <MDX components={getMdxComponents()} />
        </div>
      </div>
    </div>
  )
}
