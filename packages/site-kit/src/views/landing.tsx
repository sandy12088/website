import * as stylex from '@stylexjs/stylex';



import { styles as blockStyles } from '../components/block.stylex.ts';
import { HeroDiagram } from '../components/hero-diagram.tsx';
import { Hero } from '../components/hero.tsx';
import { PeopleGrid } from '../components/people.tsx';
import { renderInlineMarkdown } from '../content/inline-markdown.tsx';
import { resolveInternal } from '../content/links.ts';
import { translate } from '../content/strings.ts';
import { siteContext } from '../site-context.ts';
import { Collection } from './collection.tsx';
import { Resume } from './resume-section.tsx';


/**
 * Landing page renderer.
 *
 * Content pages can declare a `sections:` array. Each entry names a block
 * and carries its `content`; the blocks themselves live in `src/components/`.
 *
 * Vertical rhythm belongs to the design system (`blockStyles.section`) rather
 * than the authored `design.spacing` value: one section cadence keeps the page
 * coherent as sections are added, and the hero is the only flush section.
 */
export interface LandingPageProps {
  /** Slugs identifying the page inside the `pages` collection. */
  slugs: string[]
}

export function LandingPage({ slugs }: LandingPageProps) {
  const { locale, source } = siteContext()
  const page = source.findPage(slugs)
  if (!page) return null

  const resolve = (url: string) => resolveInternal(url)
  const t = translate(locale)

  return (
    <>
      {page.data.sections.map((section, index) => {
        const key = section.id ?? `${section.block}-${String(index)}`
        const content = section.content

        switch (section.block) {
          case 'hero':
            return (
              <section
                id={section.id}
                key={key}
                {...stylex.props(blockStyles.sectionPlain)}
              >
                <Hero
                  announcement={content.announcement}
                  noPadding={section.design.no_padding}
                  primaryAction={content.primary_action}
                  resolve={resolve}
                  secondaryAction={content.secondary_action}
                  text={content.text}
                  title={content.title}
                  visual={<HeroDiagram labels={t.heroDiagram} />}
                />
              </section>
            )

          case 'collection':
            return (
              <section
                id={section.id}
                key={key}
                {...stylex.props(blockStyles.section)}
              >
                <Collection
                  featuredOnly={content.filters.featured_only}
                  heading={content.title}
                  limit={
                    content.count === 0
                      ? Number.POSITIVE_INFINITY
                      : content.count
                  }
                  subtitle={
                    content.subtitle.length > 0 ? content.subtitle : undefined
                  }
                  text={content.text}
                  type={
                    content.filters.folders.includes('funding')
                      ? 'funding'
                      : 'publication'
                  }
                />
              </section>
            )

          case 'community/people':
            return (
              <section
                id={section.id}
                key={key}
                {...stylex.props(blockStyles.section)}
              >
                <PeopleGrid
                  groups={
                    content.user_groups.length > 0
                      ? content.user_groups
                      : source.peopleGroups()
                  }
                  intro={
                    content.text.length > 0
                      ? renderInlineMarkdown(content.text)
                      : undefined
                  }
                  showInterests={section.design.show_interests}
                  showOrganizations={section.design.show_organizations}
                  showRole={section.design.show_role}
                  showSocial={section.design.show_social}
                  subtitle={renderInlineMarkdown(content.subtitle)}
                  title={content.title}
                />
              </section>
            )

          case 'resume-awards':
          case 'resume-biography':
          case 'resume-biography-3':
          case 'resume-experience':
            return (
              <section
                id={section.id}
                key={key}
                {...stylex.props(blockStyles.section)}
              >
                <Resume section={section} />
              </section>
            )

          default:
            return null
        }
      })}
    </>
  )
}