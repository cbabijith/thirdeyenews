import test from 'node:test'
import assert from 'node:assert/strict'
import { ApiError, fetchJson } from '../apps/user-website/src/lib/http'
import { readStorage, writeStorage } from '../apps/user-website/src/lib/browserStorage'
import { articleUrl, mediaUrl } from '../apps/user-website/src/lib/site'
import { publicationDate } from '../apps/admin-website/src/features/news/publication'

const originalFetch = globalThis.fetch

test('transient GET failure retries and returns the article', async () => {
  let calls = 0
  globalThis.fetch = async () => { if (++calls === 1) throw new TypeError('socket reset'); return Response.json({ data: { title: 'Story' } }) }
  try { assert.deepEqual(await fetchJson('https://test.invalid'), { data: { title: 'Story' } }); assert.equal(calls, 2) }
  finally { globalThis.fetch = originalFetch }
})

test('a real 404 stays 404 and is not retried', async () => {
  let calls = 0
  globalThis.fetch = async () => { calls++; return new Response(null, { status: 404 }) }
  try { await assert.rejects(fetchJson('https://test.invalid'), error => error instanceof ApiError && error.status === 404); assert.equal(calls, 1) }
  finally { globalThis.fetch = originalFetch }
})

test('failed GET retries only once and remains a service error', async () => {
  let calls = 0
  globalThis.fetch = async () => { calls++; return new Response(null, { status: 503 }) }
  try { await assert.rejects(fetchJson('https://test.invalid'), error => error instanceof ApiError && error.status === 503); assert.equal(calls, 2) }
  finally { globalThis.fetch = originalFetch }
})

test('POST is not retried because it could duplicate a view', async () => {
  let calls = 0
  globalThis.fetch = async () => { calls++; throw new TypeError('connection reset') }
  try { await assert.rejects(fetchJson('https://test.invalid', { method: 'POST' })); assert.equal(calls, 1) }
  finally { globalThis.fetch = originalFetch }
})

test('hung requests abort within their budget', async () => {
  globalThis.fetch = (_url, options) => new Promise((_, reject) => options?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))
  const start = Date.now()
  try { await assert.rejects(fetchJson('https://test.invalid', {}, 30), error => error instanceof ApiError && error.status === 504); assert.ok(Date.now() - start < 1000) }
  finally { globalThis.fetch = originalFetch }
})

test('blocked browser storage never breaks article initialization', () => {
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    get sessionStorage() { throw new DOMException('Access denied', 'SecurityError') },
    get localStorage() { throw new DOMException('Access denied', 'SecurityError') },
  } })
  try { assert.equal(readStorage('sessionStorage', 'article'), null); assert.doesNotThrow(() => writeStorage('localStorage', 'theme', 'dark')) }
  finally { delete (globalThis as { window?: unknown }).window }
})

test('unsafe and malformed images fall back, normal external images remain usable', () => {
  assert.equal(mediaUrl('javascript:alert(1)'), '/logo.svg')
  assert.equal(mediaUrl('not a URL'), '/logo.svg')
  assert.equal(mediaUrl('//untrusted.example/image.jpg'), '/logo.svg')
  assert.equal(mediaUrl('https://legacy.example/image.jpg'), 'https://legacy.example/image.jpg')
  assert.equal(articleUrl({ id: 'id', slug: 'a & b' }), 'https://thirdeyenewslive.com/news/a%20%26%20b')
})

test('first publication gets a date, edits and republication preserve it', () => {
  const first = publicationDate({ is_published: false, published_at: null }, true)
  assert.ok(first instanceof Date)
  assert.equal(publicationDate({ is_published: true, published_at: first }, true), first)
  assert.equal(publicationDate({ is_published: true, published_at: first }, false), first)
  assert.equal(publicationDate({ is_published: false, published_at: first }, true), first)
  assert.equal(publicationDate(null, false), null)
  // Do not invent the publication date of a legacy story whose history is unknown.
  assert.equal(publicationDate({ is_published: true, published_at: null }, true), null)
})
