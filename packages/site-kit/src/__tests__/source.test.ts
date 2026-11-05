import type { ViteDevServer } from 'vite'
import type { ContentInput } from '../content/source.ts'

import assert from 'node:assert/strict'
import {
  mkdir,
  mkdtemp,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { defineCollections, defineDocs } from 'fumadocs-mdx/config'
import { server as contentRuntime } from 'fumadocs-mdx/runtime/server'
import { fumadocsMdx } from 'fumadocs-mdx/vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { afterAll, beforeAll, expect, it } from 'vitest'

import { contentOverlays } from '../content-overlays.ts'
import { COLLECTION_GLOBS } from '../content/collections.ts'
import { schemas } from '../content/schema.ts'
import { createSource } from '../content/source.ts'

let root: string
let vite: ViteDevServer
let input: ContentInput

const fixtures = {
  'authors/person/index.mdx': `---
title: Yuhan Ma
first_name: Yuhan
last_name: Ma
highlight_name: true
user_groups: [Principal Investigator]
---
Default biography.
`,
  'authors/person/index.en.md': `---
role: English-only role
---
`,
  'authors/person/index.zh.md': `---
title: 马宇翰
first_name: 宇翰
last_name: 马
role: 中文职称
---
中文介绍待补充。
`,
  'publications/paper/index.mdx': `---
title: Neutral paper
date: '2026-01-01'
authors: [person, external-author]
featured: true
tags: [physics, theory]
summary: Default summary
image:
  caption: Default caption
  focal_point: Right
---
## Default section

Default body.
`,
  'publications/paper/index.en.md': `---
title: English paper
summary: English-only summary
---
## English section

English-only body.
`,
  'publications/paper/index.zh.md': `---
title: 中文论文
summary: ''
tags: []
featured: false
image:
  caption: 中文图注
---
`,
  'publications/fallback/index.md': `---
title: Neutral fallback
date: '2026-02-01'
summary: Neutral summary
---
Neutral body.
`,
  'publications/fallback/index.en.mdx': `---
title: English override
---
English override body.
`,
  'publications/only/index.zh.md': `---
title: 仅中文
date: '2026-03-01'
---
独立中文内容。
`,
  'pages/index.md': `---
title: Home
design:
  spacing: 5rem
---
Default home.
`,
  'pages/index.zh.md': `---
title: 首页
---
`,
  'pages/draw/index.md': `---
title: Shared title
---
Shared body.
`,
  'pages/draw/index.zh.md': `---
---

中文介绍待补充。
`,
  'pages/clear/index.md': `---
title: Shared title
---
Default body to hide.
`,
  'pages/clear/index.zh.md': `<!-- No body for this language. -->`,
  'pages/component/index.mdx': `---
title: MDX default
---
<span>{1 + 1}</span>
`,
  'pages/component/index.zh.md': `---
title: 中文标题
---
`,
}

beforeAll(async () => {
  root = await realpath(
    await mkdtemp(path.join(os.tmpdir(), 'content-overlay-')),
  )
  await symlink(
    path.resolve(import.meta.dirname, '../../node_modules'),
    path.join(root, 'node_modules'),
    'dir',
  )
  for (const [file, body] of Object.entries(fixtures)) {
    await mkdir(path.dirname(path.join(root, file)), { recursive: true })
    await writeFile(path.join(root, file), body)
  }
  const config = {
    authorDocs: defineCollections({
      type: 'doc',
      dir: path.join(root, 'authors'),
      schema: schemas.authors,
    }),
    publicationDocs: defineCollections({
      type: 'doc',
      dir: path.join(root, 'publications'),
      schema: schemas.publications,
    }),
    pageDocs: defineDocs({
      dir: path.join(root, 'pages'),
      docs: { schema: schemas.pages },
    }),
  }
  vite = await createServer({
    configFile: false,
    root,
    appType: 'custom',
    logLevel: 'silent',
    plugins: [
      contentOverlays(root),
      fumadocsMdx({ forcedConfig: config, index: false }),
    ],
    server: { watch: { usePolling: true, interval: 50 } },
  })
  const runtime = contentRuntime<
    typeof config,
    { DocData: Record<string, unknown> }
  >()
  async function modules(
    family: 'authors' | 'publications' | 'pages',
    collection: string,
  ): Promise<Record<string, unknown>> {
    const files = Object.keys(fixtures).filter(file =>
      file.startsWith(`${family}/`),
    )
    return Object.fromEntries(
      await Promise.all(
        files.map(
          async file =>
            [
              file.slice(family.length + 1),
              (await vite.ssrLoadModule(
                `${path.join(root, file)}?collection=${collection}`,
              )) as unknown,
            ] as const,
        ),
      ),
    )
  }
  input = {
    authorDocs: await runtime.doc(
      'authorDocs',
      path.join(root, 'authors'),
      await modules('authors', 'authorDocs'),
    ),
    publicationDocs: await runtime.doc(
      'publicationDocs',
      path.join(root, 'publications'),
      await modules('publications', 'publicationDocs'),
    ),
    pageDocs: await runtime.docs(
      'pageDocs',
      path.join(root, 'pages'),
      {},
      await modules('pages', 'pageDocs'),
    ),
    eventDocs: [],
    fundingDocs: [],
  }
}, 30000)

afterAll(async () => {
  await vite.close()
  if (root) await rm(root, { recursive: true, force: true })
})

it.each(['en', 'zh'] as const)(
  'keeps publication names original on %s',
  locale => {
    const source = createSource(input, { locale })
    expect(source.findAuthor(['person'])?.data.title).toBe(
      locale === 'zh' ? '马宇翰' : 'Yuhan Ma',
    )
    expect(source.findAuthor(['person'])?.data.user_groups).toEqual([
      'Principal Investigator',
    ])
    const [author, external] = source.resolveAuthors(
      ['person', 'external-author'],
      ['Corresponding author'],
    )
    expect(author).toMatchObject({
      name: 'Yuhan Ma',
      highlight: true,
      note: 'Corresponding author',
      page: { url: '/people/person' },
    })
    expect(external).toMatchObject({ name: 'External Author', page: undefined })
    expect(source.hasTranslation('/publication/paper')).toBe(true)
  },
)

it('merges raw fields before validation, inherits bodies and replaces explicit values', () => {
  const en = createSource(input, { locale: 'en' })
  const zh = createSource(input, { locale: 'zh' })
  const paper = zh.findPublication(['paper'])
  assert.ok(paper)
  expect(paper.data).toMatchObject({
    title: '中文论文',
    date: '2026-01-01',
    authors: ['person', 'external-author'],
    summary: '',
    tags: [],
    featured: false,
    image: { caption: '中文图注', focal_point: 'Right', preview_only: false },
    toc: [{ url: '#default-section' }],
  })
  expect(renderToStaticMarkup(createElement(paper.data.body))).toContain(
    'Default body.',
  )
  expect(en.findPublication(['paper'])?.data).toMatchObject({
    title: 'English paper',
    summary: 'English-only summary',
    featured: true,
    tags: ['physics', 'theory'],
    toc: [{ url: '#english-section' }],
  })
  expect(zh.findPage([])?.data).toMatchObject({
    title: '首页',
    design: { spacing: '5rem' },
  })
  expect(zh.hasTranslation('/publication/paper')).toBe(true)
  const empty = zh.findPage(['draw'])
  assert.ok(empty)
  expect(empty.data.title).toBe('Shared title')
  expect(renderToStaticMarkup(createElement(empty.data.body))).toBe(
    '<p>中文介绍待补充。</p>',
  )
  const cleared = zh.findPage(['clear'])
  assert.ok(cleared)
  expect(cleared.data.title).toBe('Shared title')
  expect(renderToStaticMarkup(createElement(cleared.data.body))).toBe('')
  const component = zh.findPage(['component'])
  assert.ok(component)
  expect(renderToStaticMarkup(createElement(component.data.body))).toBe(
    '<span>2</span>',
  )
})

it('falls back to the neutral default, not another language, without duplicate routes', () => {
  const en = createSource(input, { locale: 'en' })
  const zh = createSource(input, { locale: 'zh' })
  expect(en.findPublication(['fallback'])?.data.title).toBe('English override')
  const fallback = zh.findPublication(['fallback'])
  assert.ok(fallback)
  expect(fallback.data).toMatchObject({
    title: 'Neutral fallback',
    summary: 'Neutral summary',
  })
  expect(renderToStaticMarkup(createElement(fallback.data.body))).toContain(
    'Neutral body.',
  )
  expect(zh.hasTranslation('/publication/fallback')).toBe(false)
  expect(en.findPublication(['only'])).toBeUndefined()
  expect(zh.findPublication(['only'])?.data.title).toBe('仅中文')
  expect(en.publicationParams().sort()).toEqual([['fallback'], ['paper']])
  expect(zh.publicationParams().sort()).toEqual([
    ['fallback'],
    ['only'],
    ['paper'],
  ])
  for (const name of [
    'index.md',
    'index.mdx',
    'index.en.md',
    'index.en.mdx',
    'index.zh.md',
    'index.zh.mdx',
  ])
    expect(
      COLLECTION_GLOBS.publications.some(pattern =>
        path.matchesGlob(`paper/${name}`, pattern),
      ),
      name,
    ).toBe(true)
})

it('invalidates translated content when its default changes in development', async () => {
  const file = path.join(root, 'publications/paper/index.mdx')
  const changed = new Promise<void>(resolve => {
    vite.watcher.once('change', () => {
      resolve()
    })
  })
  await writeFile(
    file,
    fixtures['publications/paper/index.mdx']
      .replace('Right', 'Left')
      .replace('Default body.', 'Updated default body.'),
  )
  await changed
  await expect
    .poll(async () => {
      const module = (await vite.ssrLoadModule(
        `${path.join(root, 'publications/paper/index.zh.md')}?collection=publicationDocs`,
      )) as Record<string, unknown>
      return module['frontmatter']
    })
    .toMatchObject({ image: { focal_point: 'Left', caption: '中文图注' } })
})

it('rejects invalid merged fields rather than silently using defaults', async () => {
  const file = path.join(root, 'publications/invalid/index.zh.md')
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(
    path.join(root, 'publications/invalid/index.md'),
    `---\ntitle: Valid base\ndate: '2026-01-01'\n---\n`,
  )
  await writeFile(file, `---\ndate: 42\n---\n`)
  await expect(
    vite.ssrLoadModule(`${file}?collection=publicationDocs`),
  ).rejects.toThrow(/date/)
})

it('rejects ambiguous Markdown/MDX siblings instead of choosing by import order', async () => {
  const author = input.authorDocs.find(
    entry => entry.info.path === 'person/index.zh.md',
  )
  assert.ok(author)
  expect(() =>
    createSource(
      {
        ...input,
        authorDocs: [
          ...input.authorDocs,
          { ...author, info: { ...author.info, path: 'person/index.zh.mdx' } },
        ],
      },
      { locale: 'zh' },
    ),
  ).toThrow(/Duplicate content entry/)
  const dir = path.join(root, 'publications/duplicate')
  await mkdir(dir)
  for (const extension of ['md', 'mdx'])
    await writeFile(
      path.join(dir, `index.${extension}`),
      `---\ntitle: Duplicate\ndate: '2026-01-01'\n---\n`,
    )
  await expect(
    vite.ssrLoadModule(`${dir}/index.md?collection=publicationDocs`),
  ).rejects.toThrow(/Duplicate default content/)
})
