import * as stylex from '@stylexjs/stylex';



import { styles as biographyStyles } from '../../components/biography.stylex.ts';
import { styles as blockStyles } from '../../components/block.stylex.ts';
import { HeroDiagram } from '../../components/hero-diagram.tsx';
import { Hero } from '../../components/hero.tsx';
import { PeopleGrid } from '../../components/people.tsx';
import { AuthorBio, PersonHeader, ProfileFacts } from '../../components/resume.tsx';
import { normalizeEducation } from '../../content/education.ts';
import { renderInlineMarkdown } from '../../content/inline-markdown.tsx';
import { resolveInternal } from '../../content/links.ts';
import { translate } from '../../content/strings.ts';
import { siteContext } from '../../site-context.ts';
import { Collection } from '../collection.tsx';


const copy = {
  en: {
    title: 'Theoretical Physics Lab',
    text: 'Welcome to the Yuhan Ma Research Lab at the Beijing Normal University. We are dedicated to advancing the field of theoretical physics through innovative research and collaboration.\n\nOur team is passionate about exploring new frontiers in Thermodynamics, Non-equilibrium dynamics, Physics Education.',
    announcement: '🎉 Phys.org reports our latest research.',
    readMore: 'Read more',
    publications: 'Publications',
    featured: 'Featured Publications',
    director: 'Director of lab',
    people: 'Meet the incredible team',
    peopleSubtitle:
      'check full list of all members in the **[People](/people/)** page',
  },
  zh: {
    title: '理论物理研究组',
    text: '欢迎来到北京师范大学马宇翰研究组。我们通过理论研究与学术合作，探索物理学的基本问题。\n\n我们的研究方向包括热力学、非平衡动力学与物理教育。',
    announcement: '🎉 Phys.org 报道了我们的最新研究。',
    readMore: '阅读报道',
    publications: '研究成果',
    featured: '精选论文',
    director: '研究组负责人',
    people: '研究组成员',
    peopleSubtitle: '完整名单请见**[成员页面](/people/)**。',
  },
}

export function HomePage() {
  const { locale, source } = siteContext()
  const text = copy[locale]
  const labels = translate(locale)
  const director = source.findAuthor(['yhma'])

  return (
    <>
      <section id="news" {...stylex.props(blockStyles.sectionPlain)}>
        <Hero
          announcement={{
            text: text.announcement,
            link: {
              text: text.readMore,
              url: 'https://phys.org/news/2025-01-rethinking-carnot-scientists-traditional-power.html',
            },
          }}
          noPadding
          primaryAction={{
            text: text.publications,
            url: '/publications/',
            icon: 'sparkles',
          }}
          resolve={resolveInternal}
          text={text.text}
          title={text.title}
          visual={<HeroDiagram labels={labels.heroDiagram} />}
        />
      </section>
      <section id="papers" {...stylex.props(blockStyles.section)}>
        <Collection
          featuredOnly
          heading={text.featured}
          limit={Number.POSITIVE_INFINITY}
          type="publication"
        />
      </section>
      <section {...stylex.props(blockStyles.section)}>
        {director ? (
          <div {...stylex.props(biographyStyles.container)}>
            <div {...stylex.props(biographyStyles.profileSticky)}>
              <PersonHeader
                author={director}
                nameAs="h2"
                profiles={director.data.profiles}
                role={text.director}
              />
              <ProfileFacts
                education={normalizeEducation(director.data.education)}
                interests={director.data.interests}
                labels={labels}
              />
            </div>
            <div {...stylex.props(biographyStyles.bioColumn)}>
              <div {...stylex.props(biographyStyles.bio)}>
                <AuthorBio body={director.data.body} />
              </div>
            </div>
          </div>
        ) : null}
      </section>
      <section {...stylex.props(blockStyles.section)}>
        <PeopleGrid
          groups={['pi', 'faculty', 'postdoc', 'grad', 'bachelor']}
          showInterests={false}
          showOrganizations={false}
          showRole
          showSocial
          subtitle={renderInlineMarkdown(text.peopleSubtitle)}
          title={text.people}
        />
      </section>
    </>
  )
}