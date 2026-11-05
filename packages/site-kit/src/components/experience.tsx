import type { LifeStage } from '../content/schema.ts'

import * as stylex from '@stylexjs/stylex'

import { renderInlineMarkdown } from '../content/inline-markdown.tsx'
import {
  entrySubtitle,
  entryTitle,
  entryYears,
  formatRange,
} from './bio-text.ts'
import { styles } from './biography.stylex.ts'

export interface ExperienceListProps {
  /** `i18n "experience"` / `i18n "education"`. */
  heading: string
  entries: LifeStage[]
  /** Localized `Present`, used when an entry has no end date. */
  presentLabel: string
}

/**
 * Résumé timeline.
 *
 * The date range is the left column and the entry is the reading column: a
 * visitor scans the years first, then the titles. The previous icon dot per row
 * is gone because the hairlines already separate entries; dates carry the
 * structure without an extra glyph repeating on every line.
 */
export function ExperienceList({
  entries,
  heading,
  presentLabel,
}: ExperienceListProps) {
  if (entries.length === 0) return null

  return (
    <section>
      <h2 {...stylex.props(styles.sectionHeading)}>{heading}</h2>
      <ol {...stylex.props(styles.timeline)}>
        {entries.map((entry, index) => {
          const years = entryYears(entry)
          return (
            <li
              key={`${entryTitle(entry)}-${String(index)}`}
              {...stylex.props(styles.timelineEntry)}
            >
              <span {...stylex.props(styles.timelineTime)}>
                {formatRange(years, presentLabel)}
              </span>
              <div>
                <h3 {...stylex.props(styles.timelineTitle)}>
                  {entryTitle(entry)}
                </h3>
                {entrySubtitle(entry).length > 0 ? (
                  <p {...stylex.props(styles.timelineOrg)}>
                    {entrySubtitle(entry)}
                  </p>
                ) : null}
                {entry.supervisor ? (
                  <div {...stylex.props(styles.timelineSummary)}>
                    {renderInlineMarkdown(entry.supervisor)}
                  </div>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
