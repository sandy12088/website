import type { ReactNode } from 'react'
import type { AuthorPage } from '../content/source.ts'

import * as stylex from '@stylexjs/stylex'

import { translate } from '../content/strings.ts'
import { siteContext } from '../site-context.ts'
import { styles as blockStyles } from './block.stylex.ts'
import { BlockHeading } from './block.tsx'
import { Icon } from './icon.tsx'
import { styles } from './people.stylex.ts'

export interface PeopleGridProps {
  /** `content.title` renders above the groups. */
  title?: string | undefined
  subtitle?: ReactNode
  /** `content.text`, already parsed. */
  intro?: ReactNode
  /** `content.user_groups`; only groups with members are rendered. */
  groups: readonly string[]
  showRole: boolean
  showSocial: boolean
  showInterests: boolean
  showOrganizations: boolean
  /** Archive pages use `h1` for the title; the landing section is an `h2`. */
  headingAs?: 'h1' | 'h2'
}

/**
 * "Meet the team".
 *
 * One labelled grid per `user_groups` entry, in declaration order. The heading is
 * the only place the group name appears; a rule fills the rest of the row so a
 * single-person group still reads as a group boundary rather than a stray
 * heading. Only the name links to the profile, so the portrait does not produce
 * a second, differently-named link for the same person.
 */
export function PeopleGrid({
  groups,
  headingAs = 'h2',
  intro,
  showInterests,
  showOrganizations,
  showRole,
  showSocial,
  subtitle,
  title,
}: PeopleGridProps) {
  const { locale, source } = siteContext()
  const labels = translate(locale).peopleGroups
  const grouped = source.peopleByGroup(groups)
  const groupHeadingAs = headingAs === 'h1' ? 'h2' : 'h3'

  const personHeadingAs = groupHeadingAs === 'h2' ? 'h3' : 'h4'

  return (
    <div {...stylex.props(blockStyles.column)}>
      <div {...stylex.props(blockStyles.measure)}>
        {title ? (
          <BlockHeading as={headingAs} subtitle={subtitle} title={title} />
        ) : null}
        {intro ? <div {...stylex.props(styles.intro)}>{intro}</div> : null}

        {grouped.map(group => {
          const GroupHeading = groupHeadingAs
          const headingId = `people-group-${group.group.replaceAll(/\s+/g, '-')}`
          return (
            <section
              aria-labelledby={headingId}
              key={group.group}
              {...stylex.props(styles.group)}
            >
              <div {...stylex.props(styles.groupHeadingRow)}>
                <GroupHeading
                  id={headingId}
                  {...stylex.props(styles.groupHeading)}
                >
                  {labels[group.group] ?? group.group}
                </GroupHeading>
                <span aria-hidden="true" {...stylex.props(styles.groupRule)} />
              </div>
              <div {...stylex.props(styles.grid)}>
                {group.people.map(person => (
                  <Person
                    key={person.url}
                    nameAs={personHeadingAs}
                    person={person}
                    showInterests={showInterests}
                    showOrganizations={showOrganizations}
                    showRole={showRole}
                    showSocial={showSocial}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

export interface PersonProps {
  nameAs: 'h3' | 'h4'
  person: AuthorPage
  showRole: boolean
  showSocial: boolean
  showInterests: boolean
  showOrganizations: boolean
}

function Person({
  nameAs,
  person,
  showInterests,
  showOrganizations,
  showRole,
  showSocial,
}: PersonProps) {
  const slug = person.slugs.at(-1)
  const avatar = avatarFor(slug)
  const statusIcon = statusEmoji(person.data.status?.icon ?? '')
  const organizations = person.data.organizations
  const interests = person.data.interests
  const profiles = person.data.profiles

  return (
    <article {...stylex.props(styles.person)}>
      {avatar.length > 0 ? (
        <div {...stylex.props(styles.avatarWrap)}>
          <div {...stylex.props(styles.avatarFrame)}>
            <img
              alt=""
              height={96}
              loading="lazy"
              src={avatar}
              width={96}
              {...stylex.props(styles.avatar)}
            />
          </div>
          {statusIcon.length > 0 ? (
            <span aria-hidden="true" {...stylex.props(styles.statusBadge)}>
              {statusIcon}
            </span>
          ) : null}
        </div>
      ) : (
        <div
          aria-hidden="true"
          {...stylex.props(styles.avatarFrame, styles.avatarInitials)}
        >
          {initials(person)}
        </div>
      )}

      <div {...stylex.props(styles.personInfo)}>
        <a href={person.url} {...stylex.props(styles.personName)}>
          {nameAs === 'h3' ? (
            <h3 {...stylex.props(styles.name)}>{person.data.title}</h3>
          ) : (
            <h4 {...stylex.props(styles.name)}>{person.data.title}</h4>
          )}
        </a>
        {showOrganizations
          ? organizations.map(organization => (
              <p key={organization.name} {...stylex.props(styles.role)}>
                {organization.name}
              </p>
            ))
          : null}
        {showRole && person.data.role.length > 0 ? (
          <p {...stylex.props(styles.role)}>{person.data.role}</p>
        ) : null}
        {showSocial && profiles.length > 0 ? (
          <ul {...stylex.props(styles.socialRow)}>
            {profiles
              .filter(profile => profile.url.length > 0)
              .map(profile => (
                <li key={profile.icon}>
                  <a
                    aria-label={profileLabel(profile)}
                    href={profile.url}
                    rel="noopener noreferrer"
                    target={
                      profile.url.startsWith('http') ? '_blank' : undefined
                    }
                    title={profile.label}
                    {...stylex.props(styles.socialLink)}
                  >
                    <Icon name={profile.icon} />
                  </a>
                </li>
              ))}
          </ul>
        ) : null}
        {showInterests && interests.length > 0 ? (
          <p {...stylex.props(styles.interests)}>{interests.join(', ')}</p>
        ) : null}
      </div>
    </article>
  )
}

/** A missing portrait falls back to an initial plate so the grid keeps its rhythm. */
function initials(person: AuthorPage): string {
  const first = person.data.first_name
  const last = person.data.last_name
  if (first.length > 0 || last.length > 0) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  }
  return person.data.title
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
}

/**
 * Hugo rendered emoji shortcodes in `status.icon`; the migrated front matter
 * still carries them (`:coffee:`). Unknown shortcodes render nothing rather than
 * leaking their syntax onto the page.
 */
const STATUS_EMOJI: Record<string, string> = {
  ':coffee:': '☕',
  ':fire:': '🔥',
  ':star:': '⭐',
  ':tada:': '🎉',
}

/** Profile links are labelled by their authored label, falling back to the icon key. */
function profileLabel(profile: {
  icon: string
  label?: string | undefined
}): string {
  const label = profile.label ?? ''
  return label.length > 0 ? label : profile.icon
}

function statusEmoji(value: string): string {
  return STATUS_EMOJI[value] ?? ''
}

/**
 * Hugo resolved `*avatar*` inside the content bundle and served a resized WebP.
 * The migrated bundles are copied verbatim, so the avatar is referenced by name.
 */
const AVATARS: Record<string, string> = {
  congfu: 'avatar.jpg',
  cpsun: 'avatar.png',
  erichen: 'avatar.jpg',
  hdong: 'avatar.jpg',
  htquan: 'avatar.jpg',
  hua: 'avatar.jpg',
  jfchen: 'avatar.jpg',
  jrlei: 'avatar.jpg',
  lqhuang: 'avatar.jpg',
  lynn: 'avatar.jpg',
  sandy: 'avatar.jpg',
  shiling: 'avatar.jpg',
  sushanhe: 'avatar.png',
  tuzc: 'avatar.jpg',
  yhma: 'avatar.jpg',
}

function avatarFor(slug: string | undefined): string {
  if (slug === undefined) return ''
  const file = AVATARS[slug]
  return file === undefined ? '' : `/authors/${slug}/${file}`
}

export { avatarFor }
