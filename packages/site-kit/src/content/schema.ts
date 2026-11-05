/**
 * Content model for the site.
 *
 * Every collection mirrors the front matter shape that the Hugo sources used, so
 * the migration is mechanical and nothing silently disappears. Purely
 * Hugo-specific keys (`active`, `build`, `cascade`, `headless`, `type`,
 * `weight`, `widget`) are intentionally not part of the schema.
 *
 * The schemas live here, next to the collection definitions, because
 * `source.config.ts` may only export collections — and keeping them in the kit
 * lets the test suite apply exactly the same validation to the migrated front
 * matter.
 */

import { pageSchema } from 'fumadocs-core/source/schema'
import { z } from 'zod'

export const PUBLICATION_TYPES = [
  'article-journal',
  'article-magazine',
  'article-newspaper',
  'book',
  'chapter',
  'conference-paper',
  'manuscript',
  'patent',
  'poster',
  'preprint',
  'report',
  'software',
  'thesis',
] as const
export const PublicationType = z.enum(PUBLICATION_TYPES)
export type PublicationType = z.infer<typeof PublicationType>

export const USER_GROUPS = [
  'pi',
  'faculty',
  'postdoc',
  'phd',
  'grad',
  'undergrad',
  'ra',
  'collaborator',
  'visiting',
  'alumni',
] as const
export const UserGroup = z.enum(USER_GROUPS)
export type UserGroup = z.infer<typeof UserGroup>

const urlFields = {
  url_code: z.string().default(''),
  url_dataset: z.string().default(''),
  url_pdf: z.string().default(''),
  url_poster: z.string().default(''),
  url_project: z.string().default(''),
  url_slides: z.string().default(''),
  url_source: z.string().default(''),
  url_video: z.string().default(''),
} as const

const imageDefaults = { caption: '', focal_point: '', preview_only: false }

/**
 * Attachments. Some entries carry only an `icon` (rendered from the `icon_pack`
 * icon set) and some only a `name`/`url` pair, so all four fields stay optional.
 */
const linkSchema = z.object({
  icon: z.string().optional(),
  icon_pack: z.string().optional(),
  name: z.string().optional(),
  url: z.string().default(''),
})

const publicationSchema = pageSchema.extend({
  ...urlFields,
  abstract: z.string().default(''),
  author_notes: z.array(z.string()).default([]),
  authors: z.array(z.string()).default([]),
  date: z.string(),
  doi: z.string().default(''),
  featured: z.boolean().default(false),
  fundings: z.array(z.string()).default([]),
  projects: z.array(z.string()).default([]),
  publication: z.string().default(''),
  publication_short: z.string().default(''),
  publication_types: z.array(PublicationType).default([]),
  publishDate: z.string().optional(),
  slides: z.string().default(''),
  subtitle: z.string().default(''),
  summary: z.string().default(''),
  tags: z.array(z.string()).default([]),
  links: z.array(linkSchema).default([]),
})

const fundingSchema = pageSchema.extend({
  ...urlFields,
  date_start: z.string(),
  date_end: z.string().optional(),
  external_link: z.string().default(''),
  slides: z.string().default(''),
  program: z.string().default(''),
  role: z.enum(['host', 'participant']).default('host'),
  status: z.enum(['ongoing', 'completed']).default('ongoing'),
  tags: z.array(z.string()).default([]),
})

const eventSchema = pageSchema.extend({
  ...urlFields,
  abstract: z.string().default(''),
  address: z
    .object({
      city: z.string().default(''),
      country: z.string().default(''),
      postcode: z.string().default(''),
      region: z.string().default(''),
      street: z.string().default(''),
    })
    .optional(),
  all_day: z.boolean().default(false),
  authors: z.array(z.string()).default([]),
  date: z.string(),
  date_end: z.string().optional(),
  event: z.string().default(''),
  event_url: z.string().default(''),
  featured: z.boolean().default(false),
  links: z.array(linkSchema).default([]),
  location: z.string().default(''),
  projects: z.array(z.string()).default([]),
  slides: z.string().default(''),
  summary: z.string().default(''),
  tags: z.array(z.string()).default([]),
  view: z.string().optional(),
})

const organizationSchema = z.object({
  name: z.string(),
  url: z.string().default(''),
})

const awardSchema = z.object({
  awarder: z.string().default(''),
  certificate_url: z.string().default(''),
  date: z.string().optional(),
  icon: z.string().default(''),
  summary: z.string().default(''),
  title: z.string(),
  url: z.string().default(''),
})

export const LifeStage = z.object({
  area: z.string().optional(),
  button: z.object({ text: z.string(), url: z.string() }).optional(),
  company_logo: z.string().optional(),
  company_name: z.string().optional(),
  company_url: z.string().optional(),
  date_start: z.string().default(''),
  date_end: z.preprocess(
    v => (v === '' || v === undefined ? null : v),
    z.string().nullable(),
  ),
  description: z.string().optional(),
  institution: z.string().optional(),
  position: z.string().optional(),
  supervisor: z.string().optional(),
  title: z.string().optional(),
  year: z.string().optional(),
})
export type LifeStage = z.infer<typeof LifeStage>

const profileSchema = z.object({
  icon: z.string(),
  icon_pack: z.string().optional(),
  label: z.string().optional(),
  url: z.string().default(''),
})

const authorSchema = pageSchema.extend({
  // `content/authors/misc` has no title; the original site never rendered it.
  title: z.string().default(''),
  awards: z.array(awardSchema).default([]),
  bio: z.string().default(''),
  education: z.preprocess(v => v ?? [], z.array(LifeStage)),
  email: z.string().default(''),
  first_name: z.string().default(''),
  highlight_name: z.boolean().default(false),
  interests: z.array(z.string()).default([]),
  last_name: z.string().default(''),
  name_pronunciation: z.string().optional(),
  organizations: z.array(organizationSchema).default([]),
  profiles: z.array(profileSchema).default([]),
  role: z.string().default(''),
  social: z.array(profileSchema).default([]),
  status: z
    .object({
      icon: z.string(),
    })
    .optional(),
  superuser: z.boolean().default(false),
  user_groups: z.array(UserGroup).default([]).optional(),
  work: z.array(LifeStage).default([]),
})

const pageContentSchema = pageSchema.extend({
  date: z.string().optional(),
  /**
   * Optional banner image for a standalone page, as authored on `privacy.md` and
   * `terms.md`. Nothing renders it today; it is part of the schema so those pages
   * keep the data instead of failing validation.
   */
  header: z
    .object({
      caption: z.string().default(''),
      image: z.string().default(''),
    })
    .optional(),
  draft: z.boolean().default(false),
  share: z.boolean().default(false),
})

/**
 * Every collection schema, keyed by the `content/<family>/` directory.
 *
 * Exported as one record rather than individual bindings: `source.config.ts`
 * consumes them positionally, and the test suite needs the same lookup.
 */
export const schemas = {
  authors: authorSchema,
  events: eventSchema,
  fundings: fundingSchema,
  pages: pageContentSchema,
  publications: publicationSchema,
}

export type ContentFamily = keyof typeof schemas

/** The schema a `content/<family>/` entry must satisfy. */
export function schemaFor(family: ContentFamily) {
  return schemas[family]
}

export type PageFrontmatter = z.infer<typeof pageContentSchema>
export type PublicationFrontmatter = z.infer<typeof publicationSchema>
export type FundingFrontmatter = z.infer<typeof fundingSchema>
export type EventFrontmatter = z.infer<typeof eventSchema>
export type AuthorFrontmatter = z.infer<typeof authorSchema>
