import * as stylex from '@stylexjs/stylex'

import { BackLink } from '../../components/back-link.tsx'
import { styles } from '../../components/biography.stylex.ts'
import { ExperienceList } from '../../components/experience.tsx'
import { PeopleGrid } from '../../components/people.tsx'
import {
  AuthorBio,
  PersonHeader,
  ProfileFacts,
} from '../../components/resume.tsx'
import { normalizeEducation } from '../../content/education.ts'
import { translate } from '../../content/strings.ts'
import { siteContext } from '../../site-context.ts'
import { navFor } from '../../site/nav.ts'
import { WIDTH } from '../../styles/tokens.stylex.ts'

const styles2 = stylex.create({
  /** The people index keeps its own vertical padding; the grid owns the gutters. */
  top: {
    paddingBlock: 'clamp(2.5rem, 5vw, 4rem) 0',
  },
  /** The person page's back-link row shares the page edge and gutters. */
  topBar: {
    marginInline: 'auto',
    maxWidth: WIDTH.page,
    paddingBlock: 'clamp(2.5rem, 5vw, 4rem) 0',
    paddingInline: 'clamp(1.25rem, 4vw, 2.5rem)',
    width: '100%',
  },
  page: {
    paddingBlockEnd: 'clamp(2rem, 4vw, 3rem)',
  },
  timeline: {
    marginBlockStart: 'clamp(2.5rem, 5vw, 3.5rem)',
  },
})

/** `/people/`: the full team, grouped by `user_groups` in declaration order. */
export function PeopleList() {
  const { locale, source } = siteContext()

  return (
    <div {...stylex.props(styles2.top)}>
      <PeopleGrid
        groups={source.peopleGroups()}
        headingAs="h1"
        showInterests
        showOrganizations={false}
        showRole
        showSocial
        title={locale === 'zh' ? '团队成员' : 'Meet the team'}
      />
    </div>
  )
}

/**
 * `/people/<slug>/`.
 *
 * The same profile column the home biography uses: identity and scannable facts
 * on the left, the biography in a serif reading column, then the work and
 * education timelines. The previous version centered the portrait and name above
 * a left-aligned paragraph, which left the page without a reading axis.
 */
export function PeopleDetail({ slugs = [] }: { slugs?: string[] }) {
  const { locale, source } = siteContext()
  const page = source.findAuthor(slugs)
  if (!page) return null
  const labels = translate(locale)
  const education = normalizeEducation(page.data.education)
  const backLabel =
    navFor(locale).find(item => item.to === '/people')?.label ?? 'People'

  return (
    <div {...stylex.props(styles2.page)}>
      <div {...stylex.props(styles2.topBar)}>
        <BackLink href="/people/">{backLabel}</BackLink>
      </div>
      <div {...stylex.props(styles.container)}>
        <div {...stylex.props(styles.profileSticky)}>
          <PersonHeader
            author={page}
            profiles={page.data.profiles}
            role={page.data.role}
          />
          <ProfileFacts
            education={[]}
            interests={page.data.interests}
            labels={labels}
          />
        </div>
        <div {...stylex.props(styles.bioColumn)}>
          <div {...stylex.props(styles.bio)}>
            <AuthorBio body={page.data.body} />
          </div>
        </div>
      </div>
      <div {...stylex.props(styles.timelineWrap, styles2.timeline)}>
        <div {...stylex.props(styles.experienceWrap)}>
          <ExperienceList
            entries={page.data.work}
            heading={labels.experience}
            presentLabel={labels.present}
          />
          <ExperienceList
            entries={education}
            heading={labels.education}
            presentLabel={labels.present}
          />
        </div>
      </div>
    </div>
  )
}
