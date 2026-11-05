import * as stylex from '@stylexjs/stylex'

import {
  FONT_SANS,
  FONT_SERIF,
  MOTION,
  RADIUS,
  SIZE,
  TEXT,
  theme,
  WIDTH,
} from '../styles/tokens.stylex.ts'

/** Ancestor selector for the dark colour scheme; must stay local to this module. */
const DARK = '[data-theme="dark"]'

const GUTTER = 'clamp(1.25rem, 4vw, 2.5rem)'

/**
 * The PI biography.
 *
 * A sticky profile column (portrait, name, role, affiliations, links, and the
 * facts that would otherwise interrupt the prose) beside a serif reading column.
 * The profile is the page's index: every fact a visitor might scan for lives
 * there, so the biography itself can be read as one continuous piece.
 */
export const styles = stylex.create({
  actionRow: {
    marginBlock: '1.5rem 0',
  },
  avatar: {
    borderColor: {
      default: theme.border,
      [stylex.when.ancestor(DARK)]: '#232d35',
    },
    borderRadius: RADIUS.full,
    borderStyle: 'solid',
    borderWidth: 1,
    blockSize: SIZE.avatarLg,
    display: 'block',
    inlineSize: SIZE.avatarLg,
    objectFit: 'cover',
  },
  avatarWrap: {
    flexShrink: 0,
  },
  bio: {
    color: {
      default: theme.fg,
      [stylex.when.ancestor(DARK)]: '#e9eeec',
    },
    fontFamily: FONT_SERIF.family,
    fontSize: TEXT.body,
    lineHeight: 1.72,
    minWidth: 0,
  },
  bioColumn: {
    maxWidth: '42rem',
    minWidth: 0,
  },
  container: {
    columnGap: 'clamp(2rem, 5vw, 4.5rem)',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    marginInline: 'auto',
    maxWidth: WIDTH.page,
    paddingInline: GUTTER,
    rowGap: 'clamp(2rem, 4vw, 2.75rem)',
    '@media (min-width: 1024px)': {
      gridTemplateColumns: '17rem minmax(0, 1fr)',
    },
  },
  /** Facts block under the profile; a hairline separates it from the identity. */
  facts: {
    borderBlockStartColor: {
      default: theme.border,
      [stylex.when.ancestor(DARK)]: '#232d35',
    },
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    marginBlockStart: '1.5rem',
    paddingBlockStart: '1.25rem',
  },
  factBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  factItem: {
    color: {
      default: theme.fgMuted,
      [stylex.when.ancestor(DARK)]: '#a9b4ba',
    },
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.small,
    lineHeight: 1.55,
    paddingInlineStart: '0.875rem',
    position: 'relative',
    '::before': {
      backgroundColor: {
        default: theme.accent,
        [stylex.when.ancestor(DARK)]: '#82a6ff',
      },
      borderRadius: RADIUS.full,
      blockSize: '3px',
      content: '""',
      inlineSize: '3px',
      insetBlockStart: '0.62em',
      insetInlineStart: 0,
      position: 'absolute',
    },
  },
  factLabel: {
    color: {
      default: theme.fg,
      [stylex.when.ancestor(DARK)]: '#e9eeec',
    },
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.small,
    fontWeight: 600,
    letterSpacing: '0.01em',
    marginBlock: 0,
  },
  factList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    listStyleType: 'none',
    marginBlock: 0,
    paddingInline: 0,
  },
  factMuted: {
    color: {
      default: theme.fgSubtle,
      [stylex.when.ancestor(DARK)]: '#7f8b92',
    },
  },
  name: {
    color: {
      default: theme.fg,
      [stylex.when.ancestor(DARK)]: '#e9eeec',
    },
    fontFamily: FONT_SERIF.family,
    fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
    fontOpticalSizing: 'auto',
    fontWeight: 600,
    letterSpacing: '-0.025em',
    lineHeight: 1.08,
    marginBlock: '1.25rem 0',
    textWrap: 'balance',
  },
  org: {
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.small,
    lineHeight: 1.55,
    marginBlock: 0,
  },
  orgLink: {
    color: {
      default: theme.fgMuted,
      [stylex.when.ancestor(DARK)]: '#a9b4ba',
    },
    textDecorationColor: {
      default: theme.borderStrong,
      [stylex.when.ancestor(DARK)]: '#34424c',
    },
    textDecorationLine: 'underline',
    textUnderlineOffset: 2,
    ':hover': {
      color: {
        default: theme.accent,
        [stylex.when.ancestor(DARK)]: '#a0baff',
      },
    },
  },
  profile: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    '@media (max-width: 767px)': {
      alignItems: 'center',
      textAlign: 'center',
    },
  },
  profileList: {
    alignItems: 'center',
    columnGap: '0.25rem',
    display: 'flex',
    listStyleType: 'none',
    marginBlock: '1.125rem 0',
    marginInlineStart: '-0.4375rem',
    paddingInline: 0,
    '@media (max-width: 767px)': {
      marginInlineStart: 0,
    },
  },
  profileSticky: {
    '@media (min-width: 1024px)': {
      position: 'sticky',
      top: '6rem',
    },
  },
  role: {
    color: {
      default: theme.fgMuted,
      [stylex.when.ancestor(DARK)]: '#a9b4ba',
    },
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.base,
    fontWeight: 500,
    lineHeight: 1.5,
    marginBlock: '0.25rem 0',
  },
  orgs: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    marginBlockStart: '0.75rem',
  },
  socialLink: {
    borderRadius: RADIUS.sm,
    color: {
      default: theme.fgSubtle,
      [stylex.when.ancestor(DARK)]: '#7f8b92',
    },
    display: 'inline-flex',
    padding: '0.375rem',
    transitionDuration: MOTION.hover,
    transitionProperty: 'color, background-color',
    transitionTimingFunction: MOTION.easeOut,
    '@media (hover: hover) and (pointer: fine)': {
      ':hover': {
        backgroundColor: {
          default: theme.bgSubtle,
          [stylex.when.ancestor(DARK)]: '#172028',
        },
        color: {
          default: theme.accent,
          [stylex.when.ancestor(DARK)]: '#a0baff',
        },
      },
    },
  },
  sectionHeading: {
    color: {
      default: theme.fg,
      [stylex.when.ancestor(DARK)]: '#e9eeec',
    },
    fontFamily: FONT_SERIF.family,
    fontSize: TEXT['2xl'],
    fontWeight: 600,
    letterSpacing: '-0.015em',
    lineHeight: 1.25,
    marginBlock: 0,
    marginBlockEnd: '1rem',
  },
  /** Wrapper for the experience / education / awards blocks. */
  timelineWrap: {
    marginInline: 'auto',
    maxWidth: WIDTH.page,
    paddingInline: GUTTER,
    width: '100%',
  },
  experienceWrap: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '2.5rem',
  },
  timeline: {
    listStyleType: 'none',
    marginBlock: 0,
    paddingInline: 0,
  },
  timelineEntry: {
    borderBlockStartColor: {
      default: theme.border,
      [stylex.when.ancestor(DARK)]: '#232d35',
    },
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: 1,
    columnGap: '2rem',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    paddingBlock: '1.125rem',
    rowGap: '0.25rem',
    '@media (min-width: 768px)': {
      gridTemplateColumns: '8.5rem minmax(0, 1fr)',
    },
  },
  timelineTime: {
    color: {
      default: theme.fgSubtle,
      [stylex.when.ancestor(DARK)]: '#7f8b92',
    },
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.micro,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.55,
    marginBlock: 0,
    '@media (min-width: 768px)': {
      paddingBlockStart: '0.2rem',
    },
  },
  timelineOrg: {
    color: {
      default: theme.fgMuted,
      [stylex.when.ancestor(DARK)]: '#a9b4ba',
    },
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.small,
    lineHeight: 1.55,
    marginBlock: '0.25rem 0',
  },
  timelineSummary: {
    color: {
      default: theme.fgMuted,
      [stylex.when.ancestor(DARK)]: '#a9b4ba',
    },
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.small,
    lineHeight: 1.6,
    marginBlock: '0.5rem 0',
    maxWidth: '60ch',
  },
  timelineTitle: {
    color: {
      default: theme.fg,
      [stylex.when.ancestor(DARK)]: '#e9eeec',
    },
    fontFamily: FONT_SERIF.family,
    fontSize: TEXT.body,
    fontWeight: 600,
    letterSpacing: '-0.005em',
    lineHeight: 1.35,
    marginBlock: 0,
  },
})

/** Awards list chrome; the resume-awards block shares the timeline rhythm. */
export const awardStyles = stylex.create({
  awarder: {
    color: {
      default: theme.fgMuted,
      [stylex.when.ancestor(DARK)]: '#a9b4ba',
    },
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.small,
    lineHeight: 1.5,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    minWidth: 0,
  },
  date: {
    color: {
      default: theme.fgSubtle,
      [stylex.when.ancestor(DARK)]: '#7f8b92',
    },
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.micro,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.55,
  },
  heading: {
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
  row: {
    borderBlockStartColor: {
      default: theme.border,
      [stylex.when.ancestor(DARK)]: '#232d35',
    },
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: 1,
    columnGap: '2rem',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    paddingBlock: '1.125rem',
    rowGap: '0.25rem',
    '@media (min-width: 768px)': {
      gridTemplateColumns: '8.5rem minmax(0, 1fr)',
    },
  },
  summary: {
    color: {
      default: theme.fgMuted,
      [stylex.when.ancestor(DARK)]: '#a9b4ba',
    },
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.small,
    lineHeight: 1.6,
    marginBlock: '0.25rem 0',
  },
  title: {
    color: {
      default: theme.fg,
      [stylex.when.ancestor(DARK)]: '#e9eeec',
    },
    fontFamily: FONT_SERIF.family,
    fontSize: TEXT.body,
    fontWeight: 600,
    lineHeight: 1.35,
  },
})
