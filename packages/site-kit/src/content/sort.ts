import type { AuthorPage, StoredPage } from './source.ts'

import { timestamp } from './format.ts'
import { USER_GROUPS } from './schema.ts'

/**
 * Ordering rules, matching what the Hugo templates produced.
 *
 * - publications, fundings and events: newest first (`order: desc`).
 * - people: grouped by `user_groups` in the order declared by the section, and
 *   within a group by `Params.last_name` ascending.
 *
 * These are pure functions over an already-loaded page list: which pages a site
 * has (and in which language) is the source factory's business.
 */
export type UserGroup = (typeof USER_GROUPS)[number]

/** Every supported `user_groups` value, in display order. */
export function peopleGroups(): UserGroup[] {
  return [...USER_GROUPS]
}

function sameSlugs(a: string[], b: string[]): boolean {
  return (
    a.length === b.length && a.every((segment, index) => segment === b[index])
  )
}

export function findBySlugs<T extends { slugs: string[] }>(
  pages: readonly T[],
  slugs: string[],
): T | undefined {
  return pages.find(page => sameSlugs(page.slugs, slugs))
}

export function byDateDesc<T extends { data: { date?: string } }>(
  items: readonly T[],
): T[] {
  return items.toSorted(
    (a, b) => timestamp(b.data.date) - timestamp(a.data.date),
  )
}

export function byDateStartDesc<T extends { data: { date_start?: string } }>(
  items: readonly T[],
): T[] {
  return items.toSorted(
    (a, b) => timestamp(b.data.date_start) - timestamp(a.data.date_start),
  )
}

/** People grouped for the "Meet the incredible team" block, in declaration order. */
export function peopleByGroup(
  pages: readonly AuthorPage[],
  groups: readonly UserGroup[] = USER_GROUPS,
): { group: UserGroup; people: AuthorPage[] }[] {
  return groups
    .map(group => ({
      group,
      people: pages
        .filter(page => asStringArray(page.data.user_groups).includes(group))
        .toSorted((a, b) => lastName(a).localeCompare(lastName(b))),
    }))
    .filter(entry => entry.people.length > 0)
}

export function lastName(
  page: StoredPage<{ last_name?: unknown; title: string }>,
): string {
  const value = page.data.last_name
  return typeof value === 'string' && value.length > 0 ? value : page.data.title
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}
