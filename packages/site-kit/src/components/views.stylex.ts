import * as stylex from '@stylexjs/stylex'

import {
  FONT_SANS,
  FONT_SERIF,
  MOTION,
  RADIUS,
  TEXT,
  theme,
  WIDTH,
} from '../styles/tokens.stylex.ts'

/** Ancestor selector for the dark colour scheme; must stay local to this module. */
const DARK = '[data-theme="dark"]'

const GUTTER = 'clamp(1.25rem, 4vw, 2.5rem)'

/**
 * Citation index.
 *
 * Publications are the lab's actual output, so they get an index rather than a
 * card wall: a year in the left margin, the citation in a reading column, and the
 * attachment chips at the right edge. A hairline between entries is the only
 * ornament because it carries grouping information.
 */
export const citation = stylex.create({
  authors: {
    color: {
      default: theme.fgMuted,
      [stylex.when.ancestor(DARK)]: '#a9b4ba',
    },
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.small,
    lineHeight: 1.55,
    marginBlock: 0,
  },
  bold: {
    color: {
      default: theme.fg,
      [stylex.when.ancestor(DARK)]: '#e9eeec',
    },
    fontWeight: 600,
  },
  /** Author links stay quiet inside the citation line until pointed at. */
  authorLink: {
    color: 'inherit',
    textDecorationColor: {
      default: theme.accent,
      [stylex.when.ancestor(DARK)]: '#82a6ff',
    },
    textDecorationLine: 'none',
    textUnderlineOffset: 2,
    '@media (hover: hover) and (pointer: fine)': {
      ':hover': {
        color: {
          default: theme.accent,
          [stylex.when.ancestor(DARK)]: '#a0baff',
        },
        textDecorationLine: 'underline',
      },
    },
  },
  body: {
    minWidth: 0,
  },
  entry: {
    borderBlockEndColor: {
      default: theme.border,
      [stylex.when.ancestor(DARK)]: '#232d35',
    },
    borderBlockEndStyle: 'solid',
    borderBlockEndWidth: 1,
    columnGap: 'clamp(1rem, 3vw, 2rem)',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    paddingBlock: '1.25rem',
    rowGap: '0.75rem',
    ':last-child': {
      borderBlockEndWidth: 0,
    },
    '@media (min-width: 768px)': {
      gridTemplateColumns: 'minmax(0, 1fr) auto',
    },
  },
  group: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    marginBlockEnd: 'clamp(1.75rem, 4vw, 2.75rem)',
    rowGap: '0.25rem',
    '@media (min-width: 768px)': {
      columnGap: '2.5rem',
      gridTemplateColumns: '4.5rem minmax(0, 1fr)',
    },
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
  },
  /** Year label: tabular figures so the margin column stays optically straight. */
  year: {
    color: {
      default: theme.fgSubtle,
      [stylex.when.ancestor(DARK)]: '#7f8b92',
    },
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.small,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 600,
    letterSpacing: '0.02em',
    lineHeight: 1.6,
    marginBlock: 0,
    paddingBlockStart: '1.35rem',
    '@media (max-width: 767px)': {
      paddingBlockStart: 0,
    },
  },
  attachments: {
    alignItems: 'flex-start',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
    justifyContent: 'flex-start',
    '@media (min-width: 768px)': {
      justifyContent: 'flex-end',
    },
  },
  title: {
    color: {
      default: theme.fg,
      [stylex.when.ancestor(DARK)]: '#e9eeec',
    },
    fontFamily: FONT_SERIF.family,
    fontSize: TEXT.body,
    fontOpticalSizing: 'auto',
    fontWeight: 600,
    lineHeight: 1.4,
    textDecorationColor: {
      default: theme.accent,
      [stylex.when.ancestor(DARK)]: '#82a6ff',
    },
    textDecorationLine: 'none',
    textUnderlineOffset: 3,
    textWrap: 'pretty',
    '@media (hover: hover) and (pointer: fine)': {
      ':hover': {
        textDecorationLine: 'underline',
      },
    },
  },
  venue: {
    color: {
      default: theme.fgMuted,
      [stylex.when.ancestor(DARK)]: '#a9b4ba',
    },
    fontFamily: FONT_SERIF.family,
    fontSize: TEXT.base,
    fontStyle: 'italic',
    lineHeight: 1.5,
    marginBlock: '0.375rem 0',
  },
  yearInline: {
    fontFamily: FONT_SANS.family,
    fontStyle: 'normal',
    fontVariantNumeric: 'tabular-nums',
  },
})

/**
 * Funding cards.
 *
 * Four entries, each an independent project: the only place in the system where
 * an actual card is the right container. A defined edge and a small lift on hover
 * make the whole card the target without adding a shadow.
 */
export const card = stylex.create({
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  grid: {
    columnGap: '1rem',
    display: 'grid',
    gridTemplateColumns: {
      '@media (min-width: 768px)': 'repeat(2, minmax(0, 1fr))',
      default: 'minmax(0, 1fr)',
    },
    rowGap: '1rem',
  },
  item: {
    backgroundColor: {
      default: theme.bgRaised,
      [stylex.when.ancestor(DARK)]: '#141b22',
    },
    borderColor: {
      default: theme.border,
      [stylex.when.ancestor(DARK)]: '#232d35',
    },
    borderRadius: RADIUS.xl,
    borderStyle: 'solid',
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingBlock: '1.5rem',
    paddingInline: '1.5rem',
    textDecorationLine: 'none',
    transitionDuration: MOTION.hover,
    transitionProperty: 'border-color, transform',
    transitionTimingFunction: MOTION.easeOut,
    '@media (hover: hover) and (pointer: fine)': {
      ':hover': {
        borderColor: {
          default: theme.borderStrong,
          [stylex.when.ancestor(DARK)]: '#34424c',
        },
        transform: 'translateY(-2px)',
      },
    },
  },
  meta: {
    color: {
      default: theme.fgSubtle,
      [stylex.when.ancestor(DARK)]: '#7f8b92',
    },
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.micro,
    fontVariantNumeric: 'tabular-nums',
    marginBlock: 0,
  },
  program: {
    color: {
      default: theme.fgMuted,
      [stylex.when.ancestor(DARK)]: '#a9b4ba',
    },
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.small,
    lineHeight: 1.6,
    marginBlock: 0,
    textWrap: 'pretty',
  },
  title: {
    color: {
      default: theme.fg,
      [stylex.when.ancestor(DARK)]: '#e9eeec',
    },
    fontFamily: FONT_SERIF.family,
    fontSize: TEXT.lead,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    lineHeight: 1.3,
    textWrap: 'balance',
  },
})

/** The labeled `Abstract` / `Cite` rows on a detail page. */
export const detail = stylex.create({
  body: {
    fontFamily: FONT_SERIF.family,
    fontSize: TEXT.body,
    lineHeight: 1.7,
    minWidth: 0,
  },
  grid: {
    borderBlockStartColor: {
      default: theme.border,
      [stylex.when.ancestor(DARK)]: '#232d35',
    },
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: 1,
    columnGap: '2.5rem',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    marginBlock: 0,
    paddingBlock: '1.5rem',
    rowGap: '0.5rem',
    '@media (min-width: 768px)': {
      gridTemplateColumns: '7rem minmax(0, 1fr)',
    },
  },
  label: {
    color: {
      default: theme.fgSubtle,
      [stylex.when.ancestor(DARK)]: '#7f8b92',
    },
    fontFamily: FONT_SERIF.family,
    fontSize: TEXT.base,
    fontStyle: 'italic',
    lineHeight: 1.7,
  },
})

/** Page-level chrome shared by every archive and detail view. */
export const shared = stylex.create({
  /** Standard page column: the content width, not the full editorial container. */
  page: {
    marginInline: 'auto',
    maxWidth: WIDTH.page,
    paddingBlock: 'clamp(2.5rem, 5vw, 4rem) 0',
    paddingInline: GUTTER,
    width: '100%',
  },
  header: {
    marginBlockEnd: 'clamp(2rem, 4vw, 3rem)',
    maxWidth: '48rem',
  },
  title: {
    color: {
      default: theme.fg,
      [stylex.when.ancestor(DARK)]: '#e9eeec',
    },
    fontFamily: FONT_SERIF.family,
    fontSize: 'clamp(2rem, 4.6vw, 2.875rem)',
    fontOpticalSizing: 'auto',
    fontWeight: 600,
    letterSpacing: '-0.03em',
    lineHeight: 1.04,
    marginBlock: 0,
    textWrap: 'balance',
  },
  /** Authors / venue / date line under a detail title. */
  meta: {
    color: {
      default: theme.fgMuted,
      [stylex.when.ancestor(DARK)]: '#a9b4ba',
    },
    display: 'flex',
    flexDirection: 'column',
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.small,
    gap: '0.25rem',
    lineHeight: 1.55,
    marginBlockStart: '1.125rem',
  },
  metaInline: {
    alignItems: 'center',
    columnGap: '0.5rem',
    display: 'flex',
    flexWrap: 'wrap',
    rowGap: '0.25rem',
  },
  /** Author line: inline text, not a flex row, so commas stay attached. */
  metaLine: {
    color: {
      default: theme.fgMuted,
      [stylex.when.ancestor(DARK)]: '#a9b4ba',
    },
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.small,
    lineHeight: 1.55,
  },
  venue: {
    fontFamily: FONT_SERIF.family,
    fontSize: TEXT.base,
    fontStyle: 'italic',
  },
  reading: {
    maxWidth: WIDTH.prose,
  },
  back: {
    alignItems: 'center',
    color: {
      default: theme.fgMuted,
      [stylex.when.ancestor(DARK)]: '#a9b4ba',
    },
    columnGap: '0.375rem',
    display: 'inline-flex',
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.small,
    fontWeight: 500,
    marginBlockEnd: '1.25rem',
    textDecorationLine: 'none',
    transitionDuration: MOTION.hover,
    transitionProperty: 'color',
    transitionTimingFunction: MOTION.easeOut,
    ':hover': {
      color: {
        default: theme.accent,
        [stylex.when.ancestor(DARK)]: '#a0baff',
      },
    },
  },
  backIcon: {
    blockSize: '0.875rem',
    inlineSize: '0.875rem',
  },
  /** Attachment row under a detail header. */
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBlockStart: '1.5rem',
  },
  section: {
    marginBlockStart: 'clamp(1.75rem, 4vw, 2.5rem)',
  },
  readingTitle: {
    color: {
      default: theme.fg,
      [stylex.when.ancestor(DARK)]: '#e9eeec',
    },
    fontFamily: FONT_SERIF.family,
    fontSize: TEXT['2xl'],
    fontWeight: 600,
    letterSpacing: '-0.015em',
    lineHeight: 1.25,
    marginBlock: '0 1rem',
  },
  prose: {
    fontFamily: FONT_SERIF.family,
    fontSize: TEXT.body,
    lineHeight: 1.7,
    maxWidth: WIDTH.prose,
  },
  /** Wraps the long MDX body of a detail page. */
  body: {
    marginBlockStart: 'clamp(1.5rem, 3vw, 2.25rem)',
  },
})
