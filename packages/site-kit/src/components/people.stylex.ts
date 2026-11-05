import * as stylex from '@stylexjs/stylex'

import {
  FONT_SANS,
  FONT_SERIF,
  MOTION,
  RADIUS,
  SIZE,
  TEXT,
  theme,
} from '../styles/tokens.stylex.ts'

/** Ancestor selector for the dark colour scheme; must stay local to this module. */
const DARK = '[data-theme="dark"]'

/**
 * People directory.
 *
 * One left-aligned grid per group, separated by a labelled rule. A portrait, a
 * name, a role and (optionally) field of interest: enough to know who someone is,
 * with the name as the only link so the avatar does not duplicate it in the
 * accessibility tree.
 */
export const styles = stylex.create({
  avatar: {
    blockSize: '100%',
    display: 'block',
    inlineSize: '100%',
    objectFit: 'cover',
    transitionDuration: MOTION.move,
    transitionProperty: 'transform',
    transitionTimingFunction: MOTION.easeOut,
    '@media (hover: hover) and (pointer: fine)': {
      ':hover': {
        transform: 'scale(1.045)',
      },
    },
  },
  avatarInitials: {
    alignItems: 'center',
    color: {
      default: theme.fgSubtle,
      [stylex.when.ancestor(DARK)]: '#7f8b92',
    },
    display: 'flex',
    fontFamily: FONT_SERIF.family,
    fontSize: TEXT.lead,
    fontWeight: 600,
    justifyContent: 'center',
    letterSpacing: '0.02em',
  },
  avatarWrap: {
    blockSize: SIZE.avatar,
    inlineSize: SIZE.avatar,
    position: 'relative',
  },
  avatarFrame: {
    backgroundColor: {
      default: theme.bgSubtle,
      [stylex.when.ancestor(DARK)]: '#172028',
    },
    borderColor: {
      default: theme.border,
      [stylex.when.ancestor(DARK)]: '#232d35',
    },
    borderRadius: RADIUS.full,
    borderStyle: 'solid',
    borderWidth: 1,
    blockSize: SIZE.avatar,
    inlineSize: SIZE.avatar,
    overflow: 'hidden',
    position: 'relative',
  },
  group: {
    marginBlockStart: 'clamp(2rem, 4vw, 3rem)',
    ':first-of-type': {
      marginBlockStart: 'clamp(1.25rem, 3vw, 2rem)',
    },
  },
  groupHeading: {
    color: {
      default: theme.fg,
      [stylex.when.ancestor(DARK)]: '#e9eeec',
    },
    fontFamily: FONT_SERIF.family,
    fontSize: TEXT.xl,
    fontWeight: 600,
    letterSpacing: '-0.015em',
    lineHeight: 1.3,
    marginBlock: 0,
  },
  groupHeadingRow: {
    alignItems: 'center',
    columnGap: '1rem',
    display: 'flex',
    marginBlockEnd: '1.5rem',
  },
  groupRule: {
    backgroundColor: {
      default: theme.border,
      [stylex.when.ancestor(DARK)]: '#232d35',
    },
    blockSize: 1,
    flexGrow: 1,
  },
  grid: {
    columnGap: '2rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))',
    rowGap: '2.5rem',
    '@media (max-width: 767px)': {
      columnGap: '1rem',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
  interests: {
    color: {
      default: theme.fgSubtle,
      [stylex.when.ancestor(DARK)]: '#7f8b92',
    },
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.micro,
    lineHeight: 1.5,
    marginBlock: 0,
    maxWidth: '26ch',
  },
  intro: {
    color: {
      default: theme.fgMuted,
      [stylex.when.ancestor(DARK)]: '#a9b4ba',
    },
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.body,
    lineHeight: 1.6,
    marginBlock: '0 0 clamp(1.5rem, 3vw, 2.25rem)',
    maxWidth: '58ch',
  },
  name: {
    color: {
      default: theme.fg,
      [stylex.when.ancestor(DARK)]: '#e9eeec',
    },
    fontFamily: FONT_SERIF.family,
    fontSize: TEXT.body,
    fontOpticalSizing: 'auto',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    lineHeight: 1.3,
    marginBlock: 0,
  },
  person: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
    minWidth: 0,
    '@media (max-width: 767px)': {
      alignItems: 'center',
      textAlign: 'center',
      ':only-child': {
        gridColumn: '1 / -1',
      },
    },
  },
  personInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    minWidth: 0,
    '@media (max-width: 767px)': {
      alignItems: 'center',
      maxWidth: '100%',
      overflowWrap: 'anywhere',
    },
  },
  personName: {
    alignSelf: 'flex-start',
    '@media (max-width: 767px)': {
      alignSelf: 'center',
    },
    textDecorationColor: {
      default: theme.accent,
      [stylex.when.ancestor(DARK)]: '#82a6ff',
    },
    textDecorationLine: 'none',
    textUnderlineOffset: 3,
    '@media (hover: hover) and (pointer: fine)': {
      ':hover': {
        textDecorationLine: 'underline',
      },
    },
  },
  role: {
    color: {
      default: theme.fgMuted,
      [stylex.when.ancestor(DARK)]: '#a9b4ba',
    },
    fontFamily: FONT_SANS.family,
    fontSize: TEXT.small,
    lineHeight: 1.45,
    marginBlock: 0,
  },
  socialLink: {
    borderRadius: RADIUS.sm,
    color: {
      default: theme.fgSubtle,
      [stylex.when.ancestor(DARK)]: '#7f8b92',
    },
    display: 'inline-flex',
    padding: '0.3125rem',
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
  socialRow: {
    alignItems: 'center',
    columnGap: '0.125rem',
    display: 'flex',
    listStyleType: 'none',
    marginBlock: '0.125rem 0',
    marginInlineStart: '-0.3125rem',
    paddingInline: 0,
    '@media (max-width: 767px)': {
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginInlineStart: 0,
    },
  },
  statusBadge: {
    backgroundColor: {
      default: theme.bgRaised,
      [stylex.when.ancestor(DARK)]: '#141b22',
    },
    borderColor: {
      default: theme.border,
      [stylex.when.ancestor(DARK)]: '#232d35',
    },
    borderRadius: RADIUS.full,
    borderStyle: 'solid',
    borderWidth: 1,
    blockSize: '1.5rem',
    display: 'flex',
    fontSize: '0.8125rem',
    inlineSize: '1.5rem',
    insetBlockEnd: '-2px',
    insetInlineEnd: '-2px',
    justifyContent: 'center',
    lineHeight: 1,
    position: 'absolute',
  },
})
