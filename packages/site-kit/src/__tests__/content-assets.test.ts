import assert from 'node:assert/strict'
import {
  glob,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { build, createServer } from 'vite'
import { afterEach, beforeEach, expect, it } from 'vitest'

import { contentAssets } from '../content-assets.ts'

let root: string
let content: string
const resources = {
  'authors/person/avatar.JPG': 'avatar bytes',
  'authors/王/image with space.png': 'another image',
  'publications/pat/paper/cite.bib': '@article{example}',
  'publications/paper/artifacts.pdf': '%PDF-1.7 example',
}

beforeEach(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), 'content-assets-'))
  content = path.join(root, 'content')
  for (const [file, body] of Object.entries({
    ...resources,
    'authors/person/index.mdx': 'private MDX source',
    'publications/paper/.hidden.pdf': 'hidden file',
    'publications/paper/notes.txt': 'private notes',
    'events/event/slides.pdf': 'outside the supported collections',
  })) {
    await mkdir(path.dirname(path.join(content, file)), { recursive: true })
    await writeFile(path.join(content, file), body)
  }
  await writeFile(path.join(root, 'entry.js'), 'export const example = 1')
  await writeFile(path.join(root, 'private.pdf'), 'outside content')
  await symlink(
    path.join(root, 'private.pdf'),
    path.join(content, 'authors/person/link.pdf'),
  )
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

it('serves current bundle resources without exposing source or escaped paths', async () => {
  const server = await createServer({
    configFile: false,
    root,
    appType: 'custom',
    plugins: [contentAssets(content)],
    server: { port: 0 },
  })
  try {
    await server.listen()
    const origin = server.resolvedUrls?.local[0]
    assert.ok(origin)
    for (const [file, body] of Object.entries(resources)) {
      const response = await fetch(`${origin}${encodeURI(file)}?download=1`)
      expect(response.status).toBe(200)
      expect(await response.text()).toBe(body)
    }
    const pdf = await fetch(`${origin}publications/paper/artifacts.pdf`, {
      method: 'HEAD',
    })
    expect(pdf.headers.get('content-type')).toBe('application/pdf')
    expect(Number(pdf.headers.get('content-length'))).toBe(
      resources['publications/paper/artifacts.pdf'].length,
    )
    expect(await pdf.text()).toBe('')

    const added = path.join(content, 'publications/paper/new.pdf')
    await writeFile(added, 'new resource')
    expect(
      await (await fetch(`${origin}publications/paper/new.pdf`)).text(),
    ).toBe('new resource')
    await writeFile(added, 'updated resource')
    expect(
      await (await fetch(`${origin}publications/paper/new.pdf`)).text(),
    ).toBe('updated resource')
    await rm(added)

    for (const file of [
      'publications/paper/new.pdf',
      'authors/person/index.mdx',
      'publications/paper/.hidden.pdf',
      'publications/paper/notes.txt',
      'events/event/slides.pdf',
      'authors/person/link.pdf',
      'authors/person/..%2f..%2f..%2fprivate.pdf',
      'authors/person/..%5c..%5cprivate.pdf',
    ]) {
      expect((await fetch(`${origin}${file}`)).status, file).toBe(404)
    }
    expect((await fetch(`${origin}authors/person/%ZZ.pdf`)).status).toBe(400)
  } finally {
    await server.close()
  }
})

it('builds only allowed resources with stable paths and unchanged bytes', async () => {
  await build({
    configFile: false,
    root,
    plugins: [contentAssets(content)],
    logLevel: 'silent',
    build: { rollupOptions: { input: path.join(root, 'entry.js') } },
  })
  const published = []
  for await (const file of glob('**/*', {
    cwd: path.join(root, 'dist'),
    withFileTypes: true,
  })) {
    if (!file.isFile()) continue
    const relative = path.relative(
      path.join(root, 'dist'),
      path.join(file.parentPath, file.name),
    )
    if (relative.startsWith('assets/')) continue
    published.push(relative)
    expect(await readFile(path.join(root, 'dist', relative), 'utf8')).toBe(
      resources[relative as keyof typeof resources],
    )
  }
  expect(published.sort()).toEqual(Object.keys(resources).sort())
})
