import type { ReactNode } from 'react'
import type { PageSection } from '../content/schema.ts'

import * as stylex from '@stylexjs/stylex'

import { AwardsList } from '../components/awards.tsx'
import { styles } from '../components/biography.stylex.ts'
import { ExperienceList } from '../components/experience.tsx'
import { AuthorBio, PersonHeader, ProfileFacts } from '../components/resume.tsx'
import { actionLinkStyles } from '../components/ui/action-link.stylex.ts'
import { ActionLink } from '../components/ui/action-link.tsx'
import { normalizeEducation } from '../content/education.ts'
import { renderInlineMarkdown } from '../content/inline-markdown.tsx'
import { resolveInternal } from '../content/links.ts'
import { translate } from '../content/strings.ts'
import { siteContext } from '../site-context.ts'

export interface ResumeProps {
  section: PageSection
}

/**
 * Résumé blocks.
 *
 * `resume-biography` / `resume-biography-3` render the portrait, identity and
 * facts in a sticky profile column beside the serif biography;
 * `resume-experience` and `resume-awards` render the timeline lists. All four
 * read `content.username`, which is the author directory name.
 */
export function Resume({ section }: ResumeProps) {
  const { locale, source } = siteContext()
  const author = source.findAuthor([section.content.username])
  if (!author) return null

  const labels = translate(locale)
  const role =
    section.content.text.length > 0 ? section.content.text : author.data.role

  switch (section.block) {
    case 'resume-biography':
    case 'resume-biography-3': {
      const data = author.data
      const education = normalizeEducation(data.education)
      const button = section.content.button

      return (
        <div {...stylex.props(styles.container)}>
          <div {...stylex.props(styles.profileSticky)}>
            <PersonHeader
              author={author}
              nameAs="h2"
              profiles={data.profiles}
              role={section.block === 'resume-biography-3' ? role : undefined}
            />
            <ProfileFacts
              education={education}
              interests={data.interests}
              labels={labels}
            />
          </div>

          <div {...stylex.props(styles.bioColumn)}>
            <div {...stylex.props(styles.bio)}>
              <AuthorBio body={data.body} />
            </div>
            {button ? (
              <p {...stylex.props(styles.actionRow)}>
                <ActionLink
                  href={resolveInternal(button.url)}
                  rel="noopener noreferrer"
                  target="_blank"
                  xstyle={[actionLinkStyles.base, actionLinkStyles.secondary]}
                >
                  {button.text}
                  <Arrow />
                </ActionLink>
              </p>
            ) : null}
          </div>
        </div>
      )
    }

    case 'resume-experience': {
      const work = author.data.work
      const education = normalizeEducation(author.data.education)
      return (
        <div {...stylex.props(styles.timelineWrap)}>
          <div {...stylex.props(styles.experienceWrap)}>
            <ExperienceList
              entries={work}
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
      )
    }

    case 'resume-awards':
      return (
        <div {...stylex.props(styles.timelineWrap)}>
          <AwardsList
            awards={author.data.awards}
            dateFormat="year"
            heading={
              section.content.title.length > 0
                ? section.content.title
                : labels.awards
            }
            renderSummary={(text: string): ReactNode =>
              renderInlineMarkdown(text)
            }
          />
        </div>
      )

    default:
      return null
  }
}

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="12"
      viewBox="0 0 12 12"
      width="12"
    >
      <path
        d="M2.5 6h7M6.5 3l3 3-3 3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}
