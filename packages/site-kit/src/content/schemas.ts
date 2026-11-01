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

const mediaFields = {
  image: z
    .object({
      caption: z.string().default(''),
      focal_point: z.string().default(''),
      preview_only: z.boolean().default(false),
    })
    .default(imageDefaults),
} as const

/** Publication kinds seen in `publication_types`, plus the usual CSL names. */
const publicationTypeSchema = z.enum([
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
])

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
  ...mediaFields,

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
  publication_types: z.array(publicationTypeSchema).default([]),
  publishDate: z.string().optional(),
  slides: z.string().default(''),
  subtitle: z.string().default(''),
  summary: z.string().default(''),
  tags: z.array(z.string()).default([]),
  links: z.array(linkSchema).default([]),
})

const fundingSchema = pageSchema.extend({
  ...urlFields,
  ...mediaFields,

  date: z.string(),
  dateEnd: z.string().optional(),
  external_link: z.string().default(''),
  slides: z.string().default(''),
  summary: z.string().default(''),
  tags: z.array(z.string()).default([]),
})

const eventSchema = pageSchema.extend({
  ...urlFields,
  ...mediaFields,

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

/**
 * One résumé entry.
 *
 * The older author bundles (`cpSun`) still use Wowchemy's nested
 * `education: { courses: [...] }` with `course`/`year`, while the newer ones use
 * the flat `area`/`institution`/`date_start` shape. Both are accepted so no
 * authored content is dropped.
 */
const datedEntrySchema = z.object({
  area: z.string().optional(),
  button: z.object({ text: z.string(), url: z.string() }).optional(),
  company_logo: z.string().optional(),
  company_name: z.string().optional(),
  company_url: z.string().optional(),
  course: z.string().optional(),
  date_end: z.string().default(''),
  date_start: z.string().optional(),
  description: z.string().optional(),
  institution: z.string().optional(),
  position: z.string().optional(),
  summary: z.string().optional(),
  title: z.string().optional(),
  year: z.string().optional(),
})

const legacyEducationSchema = z.object({
  courses: z.array(datedEntrySchema).default([]),
})

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
  education: z
    .union([z.array(datedEntrySchema), legacyEducationSchema])
    .default([]),
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
      icon: z.string().default(''),
    })
    .optional(),
  superuser: z.boolean().default(false),
  user_groups: z.array(z.string()).default([]),
  work: z.array(datedEntrySchema).default([]),
})

/** A call to action: the hero buttons and the section-level `button`. */
const actionSchema = z.object({
  icon: z.string().optional(),
  text: z.string(),
  url: z.string(),
})

/**
 * Section `content:` and `design:` blocks.
 *
 * Declared as named constants so their defaults can be typed with
 * `z.infer<typeof …>`. `.default({})` does not type-check: zod expects the
 * *output* type, whose nested fields already carry their own defaults.
 */
const sectionContentSchema = z.object({
  announcement: z
    .object({
      link: actionSchema.omit({ icon: true }).optional(),
      text: z.string(),
    })
    .optional(),
  button: actionSchema.optional(),
  count: z.number().default(0),
  filters: z
    .object({
      exclude_featured: z.boolean().default(false),
      exclude_future: z.boolean().default(false),
      exclude_past: z.boolean().default(false),
      featured_only: z.boolean().default(false),
      folders: z.array(z.string()).default([]),
    })
    .default({
      exclude_featured: false,
      exclude_future: false,
      exclude_past: false,
      featured_only: false,
      folders: [],
    }),
  order: z.enum(['asc', 'desc']).default('desc'),
  primary_action: actionSchema.optional(),
  secondary_action: actionSchema.optional(),
  sort_ascending: z.boolean().default(true),
  sort_by: z.string().default('Params.last_name'),
  subtitle: z.string().default(''),
  text: z.string().default(''),
  title: z.string().default(''),
  user_groups: z.array(z.string()).default([]),
  username: z.string().default(''),
})

const sectionDesignSchema = z.object({
  columns: z.number().default(1),
  date_format: z.string().default('January 2006'),
  fill_image: z.boolean().default(true),
  is_education_first: z.boolean().default(false),
  no_padding: z.boolean().default(false),
  show_interests: z.boolean().default(false),
  show_organizations: z.boolean().default(false),
  show_role: z.boolean().default(true),
  show_social: z.boolean().default(false),
  view: z
    .enum(['article-grid', 'card', 'citation', 'date-title-summary'])
    .default('citation'),
})

type SectionContent = z.infer<typeof sectionContentSchema>
type SectionDesign = z.infer<typeof sectionDesignSchema>

/**
 * Defaults applied when a section omits a field.
 *
 * Typed as the full schema output, because `.default()` requires the complete
 * type: nested objects such as `filters` are required in the output even though
 * they are optional in the authored front matter.
 */
function sectionContentDefaults(): SectionContent {
  return {
    announcement: undefined,
    button: undefined,
    count: 0,
    filters: {
      exclude_featured: false,
      exclude_future: false,
      exclude_past: false,
      featured_only: false,
      folders: [],
    },
    order: 'desc',
    primary_action: undefined,
    secondary_action: undefined,
    sort_ascending: true,
    sort_by: 'Params.last_name',
    subtitle: '',
    text: '',
    title: '',
    user_groups: [],
    username: '',
  }
}

function sectionDesignDefaults(): SectionDesign {
  return {
    columns: 1,
    date_format: 'January 2006',
    fill_image: true,
    is_education_first: false,
    no_padding: false,
    show_interests: false,
    show_organizations: false,
    show_role: true,
    show_social: false,
    view: 'citation',
  }
}

/** Page sections: the replacement for Hugo's landing-page `sections:` array. */
const sectionSchema = z.object({
  block: z.enum([
    'collection',
    'community/people',
    'hero',
    'resume-awards',
    'resume-biography',
    'resume-biography-3',
    'resume-experience',
  ]),
  content: sectionContentSchema.default(sectionContentDefaults),
  design: sectionDesignSchema.default(sectionDesignDefaults),
  id: z.string().optional(),
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
  design: z
    .object({
      spacing: z.string().default('3rem'),
    })
    .default({ spacing: '3rem' }),

  draft: z.boolean().default(false),
  sections: z.array(sectionSchema).default([]),
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

export type PageSection = z.infer<typeof sectionSchema>
export type PageFrontmatter = z.infer<typeof pageContentSchema>
export type PublicationFrontmatter = z.infer<typeof publicationSchema>
export type FundingFrontmatter = z.infer<typeof fundingSchema>
export type EventFrontmatter = z.infer<typeof eventSchema>
export type AuthorFrontmatter = z.infer<typeof authorSchema>
