export { authorHref, resolveAuthors } from './authors.ts'
export type { ResolvedAuthor } from './authors.ts'
export { normalizeEducation } from './education.ts'
export {
  formatDate,
  formatLongDate,
  formatMonthYear,
  formatYear,
  isFuture,
  SHARE_TARGETS,
  shareHref,
  shareTitle,
  timestamp,
} from './format.ts'
export type { ShareTarget } from './format.ts'
export { createSiteI18n } from './i18n.ts'
export { renderInlineMarkdown } from './inline-markdown.tsx'
export {
  absoluteUrl,
  alternateUrl,
  resolveInternal,
  siteHref,
} from './links.ts'
export type { SiteLink } from './links.ts'
export { schemaFor, schemas } from './schema.ts'
export type {
  AuthorFrontmatter,
  ContentFamily,
  EventFrontmatter,
  FundingFrontmatter,
  PageFrontmatter,
  PublicationFrontmatter,
} from './schema.ts'
export { peopleGroups } from './sort.ts'
export type { UserGroup } from './sort.ts'
export { createSource } from './source.ts'
export type {
  AnyPage,
  AuthorData,
  AuthorPage,
  ContentInput,
  ContentSource,
  EventData,
  EventPage,
  FundingData,
  FundingPage,
  PagePage,
  PublicationData,
  PublicationPage,
  StoredPage,
} from './source.ts'
export { translate } from './strings.ts'
export type { UiStrings } from './strings.ts'
