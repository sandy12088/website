import type { ReactNode } from 'react'

import * as stylex from '@stylexjs/stylex'

import { FONT_SANS, RADIUS, theme } from '../styles/tokens.stylex.ts'
import { resolveInternal } from './links.ts'

const DARK = '[data-theme="dark"]'

export const styles = stylex.create({
  code: {
    backgroundColor: {
      default: theme.bgSubtle,
      [stylex.when.ancestor(DARK)]: '#172028',
    },
    borderRadius: RADIUS.sm,
    fontFamily: FONT_SANS.mono,
    fontSize: '0.875em',
    paddingBlock: '0.1em',
    paddingInline: '0.3em',
  },
  link: {
    color: {
      default: theme.accent,
      [stylex.when.ancestor(DARK)]: '#a0baff',
    },
    fontWeight: 500,
    textDecorationColor: {
      default: theme.accent,
      [stylex.when.ancestor(DARK)]: '#82a6ff',
    },
    textDecorationLine: 'none',
    textUnderlineOffset: 2,
    ':focus-visible': {
      borderRadius: RADIUS.sm,
      outlineColor: {
        default: theme.accent,
        [stylex.when.ancestor(DARK)]: '#82a6ff',
      },
      outlineOffset: 2,
      outlineStyle: 'solid',
      outlineWidth: 2,
    },
    ':hover': {
      textDecorationThickness: 2,
    },
  },
})

/**
 * Inline markdown for the short authored fields.
 *
 * Subtitles and summaries use emphasis, links and inline code:
 * `check full list of all members in the **[People](/people/)** page`. The
 * previous build ran these through Hugo's `RenderString`; this covers the syntax
 * that actually appears, so no MDX compiler is needed to render a one-line string
 * inside a server component.
 *
 * Links and code are styled here rather than left to the browser default so an
 * authored subtitle matches the palette instead of arriving in link blue.
 */
export function renderInlineMarkdown(text: string): ReactNode {
  const parts = text
    .split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`|_[^_]+_)/g)
    .filter(Boolean)

  return (
    <>
      {parts.map((part, index) => {
        const key = `${part}-${String(index)}`

        const bold = /^\*\*(.+)\*\*$/.exec(part)
        if (bold) return <strong key={key}>{bold[1]}</strong>

        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
        if (link) {
          return (
            <a
              href={resolveInternal(link[2] ?? '')}
              key={key}
              {...stylex.props(styles.link)}
            >
              {link[1]}
            </a>
          )
        }

        const code = /^`(.+)`$/.exec(part)
        if (code) {
          return (
            <code key={key} {...stylex.props(styles.code)}>
              {code[1]}
            </code>
          )
        }

        const emphasis = /^_(.+)_$/.exec(part)
        if (emphasis) return <em key={key}>{emphasis[1]}</em>

        return <span key={key}>{part}</span>
      })}
    </>
  )
}
