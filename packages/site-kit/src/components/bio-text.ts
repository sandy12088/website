/**
 * Résumé entry helpers.
 *
 * Two shapes reached this point from Hugo: the flat `area`/`institution` form
 * (`content/authors/yhma`) and the older Wowchemy `course`/`year` form still used
 * by `cpSun`. Both collapse to a title, a subtitle and a year range.
 */

import type { LifeStage } from '../content/schema.ts'

import { formatShortMonthYear } from '../content/format.ts'

export function entryTitle(entry: LifeStage): string {
  return entry.position ?? entry.area ?? entry.title ?? entry.course ?? ''
}

export function entrySubtitle(entry: LifeStage): string {
  return entry.company_name ?? entry.institution ?? ''
}

/** `2015-09-01` + `2020-06-01`, or the legacy free-form `year` field. */
export function entryYears(entry: LifeStage): string[] {
  if (entry.year !== undefined && entry.year.length > 0) return [entry.year]
  return [entry.date_start, entry.date_end].filter(
    (value): value is string => typeof value === 'string' && value.length > 0,
  )
}

/**
 * A résumé date range. ISO content dates become `Sep 2015 – Jun 2020`; the
 * legacy free-form `year` field passes through untouched, and an open end uses
 * the localized `Present` label.
 */
export function formatRange(
  years: readonly string[],
  presentLabel: string,
): string {
  const [start, end] = years
  if (start === undefined) return ''
  if (end === undefined) return `${formatDateLabel(start)} – ${presentLabel}`
  return `${formatDateLabel(start)} – ${formatDateLabel(end)}`
}

function formatDateLabel(value: string): string {
  const formatted = formatShortMonthYear(value)
  return formatted.length > 0 ? formatted : value
}
