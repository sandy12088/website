import * as stylex from '@stylexjs/stylex'
import { defineConsts, defineVars } from '@stylexjs/stylex'

/**
 * Design tokens for the lab sites.
 *
 * These are no longer the previous Tailwind ramp: the sites now share one
 * editorial visual system — ink on paper, a scientific serif for reading, and a
 * single cobalt accent that marks anything interactive. The palette keeps its
 * light values here and its dark values beside each rule that uses them, because
 * StyleX only accepts literals in conditional values (see the note on `DARK`
 * below).
 *
 * Both sites build from this file; neither app overrides a token.
 */

/**
 * Marks the subtree that renders with dark-mode values.
 *
 * The generated class is applied to `<html>` alongside `data-theme`
 * (`themeMarker` in `stylex.props`), and every `DARK` condition compiles to
 * `:where(.x-default-marker[data-theme="dark"] *)`, which requires an ancestor
 * carrying both the marker class and the `data-theme="dark"` attribute.
 */
export const themeMarker = stylex.defaultMarker()

/**
 * Dark-mode condition for any descendant of the marked element.
 *
 * Every condition object that mixes a light and a dark value repeats this shape:
 * `{ default: light, [stylex.when.ancestor('[data-theme="dark"]')]: dark }`.
 * It must be written inline in each styling module, because the compiler only
 * rewrites `stylex.when.*` calls in the module it is processing: a shared
 * constant would resolve to the runtime stub and fail condition validation. The
 * same rule applies to the dark hex values themselves: an imported constant binds
 * as a StyleX value object and fails condition validation, so the dark half of a
 * pair is always a literal at the call site.
 *
 * The canonical pairs are, for reference:
 *
 * | token         | light     | dark      |
 * | ------------- | --------- | --------- |
 * | background    | `#fffefa` | `#0c1116` |
 * | raised        | `#fffefa` | `#141b22` |
 * | subtle        | `#ecefea` | `#172028` |
 * | text          | `#171b1e` | `#e9eeec` |
 * | text muted    | `#4a545a` | `#a9b4ba` |
 * | text subtle   | `#667175` | `#7f8b92` |
 * | border        | `#dde1db` | `#232d35` |
 * | border strong | `#c9cfc8` | `#34424c` |
 * | accent        | `#1744f5` | `#82a6ff` |
 * | accent hover  | `#1a44bf` | `#a0baff` |
 * | on accent     | `#ffffff` | `#0a1018` |
 * | accent soft   | `#e7ecfb` | `#18233d` |
 * | warm          | `#8f4b0d` | `#f0b76d` |
 * | warm soft     | `#f6e9d8` | `#2a2013` |
 */

/**
 * Type families.
 *
 * Source Serif 4 carries the editorial voice (headings, publication titles and
 * long-form prose); Inter is the interface face (navigation, metadata, controls).
 * Both are self-hosted as variable Latin subsets and declared in
 * `src/styles/global.css`; the Chinese sites fall back to the platform's CJK
 * faces so the two locales share one hierarchy without a multi-megabyte CJK
 * download.
 */
export const FONT_SERIF = defineConsts({
  family:
    '"Source Serif 4", "Source Serif Pro", "Songti SC", "STSong", "Noto Serif CJK SC", "Noto Serif SC", Georgia, "Times New Roman", serif',
})

export const FONT_SANS = defineConsts({
  family:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
})

/*
 * Responsive breakpoints are written as string literals inside each
 * `stylex.create` call rather than shared from this module: a shared constant
 * resolves to a plain string at compile time and the compiler then emits it as a
 * custom-property name instead of an at-rule. The system uses three of them:
 * 640px (large phone), 768px (tablet / two-column), 1024px (desktop navigation
 * and reading layouts), plus 1280px where a layout needs the full container.
 */

/** Spacing scale (Tailwind-compatible 4px steps, still used by every module). */
export const SPACE = defineConsts({
  '0.5': '0.125rem',
  '1': '0.25rem',
  '1.5': '0.375rem',
  '2': '0.5rem',
  '2.5': '0.625rem',
  '3': '0.75rem',
  '3.5': '0.875rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '7': '1.75rem',
  '8': '2rem',
  '9': '2.25rem',
  '10': '2.5rem',
  '11': '2.75rem',
  '12': '3rem',
  '14': '3.5rem',
  '16': '4rem',
  '20': '5rem',
  '24': '6rem',
  '28': '7rem',
  '32': '8rem',
  '36': '9rem',
  '40': '10rem',
  '44': '11rem',
  '48': '12rem',
  '56': '14rem',
  '64': '16rem',
})

/**
 * Type scale.
 *
 * Two readings share one scale: `base`/`small`/`micro` are interface sizes,
 * `body`/`lead` are reading sizes, and the serif display is fluid so a phone
 * gets a headline rather than a squeezed desktop one.
 */
export const TEXT = defineConsts({
  display: 'clamp(2.75rem, 5.6vw, 4.5rem)',
  '4xl': '2.25rem',
  '3xl': '1.75rem',
  '2xl': '1.5rem',
  xl: '1.25rem',
  lead: '1.1875rem',
  body: '1.0625rem',
  base: '0.9375rem',
  small: '0.8125rem',
  micro: '0.75rem',
})

/**
 * Layout widths.
 *
 * `page` is the one alignment edge shared by the hero, section headings, year
 * labels and page titles; `measure` is the narrower column reading content sits
 * in, left-aligned inside it. `prose` is a line measure, not a container.
 */
export const WIDTH = defineConsts({
  container: '76rem',
  content: '64rem',
  measure: '64rem',
  nav: '76rem',
  page: '76rem',
  prose: '68ch',
})

/** Fixed avatar sizes used by the people grid and the profile header. */
export const SIZE = defineConsts({
  avatar: '96px',
  avatarLg: '152px',
})

/** Corner radii: controls, cards, and the one large surface. */
export const RADIUS = defineConsts({
  sm: '4px',
  md: '6px',
  lg: '10px',
  xl: '14px',
  full: '9999px',
})

/** Motion: strong custom curves, short UI durations. */
export const MOTION = defineConsts({
  easeInOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
  easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
  hover: '180ms',
  move: '240ms',
  press: '140ms',
  reveal: '700ms',
})

/**
 * Theme variables.
 *
 * Plain `defineVars` rather than `createTheme` output on purpose: dark mode is
 * expressed per-property through the `DARK` condition, so each element keeps one
 * class list and the document needs no extra theme class. Only colors that read
 * the same in both modes can live here; a value with a dark counterpart is
 * written as an inline pair at its call site.
 */
export const theme = defineVars({
  accent: '#1744f5',
  accentHover: '#1a44bf',
  accentFg: '#ffffff',
  accentSoft: '#e7ecfb',
  bg: '#fffefa',
  bgRaised: '#fffefa',
  bgSubtle: '#ecefea',
  border: '#dde1db',
  borderStrong: '#c9cfc8',
  fg: '#171b1e',
  fgMuted: '#4a545a',
  fgSubtle: '#667175',
  warm: '#8f4b0d',
  warmSoft: '#f6e9d8',
})

/** Body background in dark mode; also the `<meta name="theme-color">` value. */
export const HB_DARK = '#0c1116'
