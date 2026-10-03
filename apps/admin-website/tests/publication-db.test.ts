import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { db } from '../src/db'
import { newsRepository } from '../src/features/news/repositories/news.repository'
import { newsService } from '../src/features/news/services/news.service'
import type { News } from '../src/features/news/types'

const databaseUrl = new URL(process.env.DATABASE_URL || 'postgres://localhost/none')
if (databaseUrl.hostname !== '127.0.0.1' || databaseUrl.port !== '55439' || databaseUrl.pathname !== '/thirdeye_reader_test') throw new Error('Only the isolated local test database is allowed')
const client = (db as typeof db & { $client: import('postgres').Sql }).$client
const article = (slug: string) => ({ title:'Test story', content:'<p>Story</p>', slug, is_published:false } as Omit<News,'id'|'created_at'|'updated_at'>)
before(async () => { await client`truncate news cascade` })
after(async () => { await client.end() })

test('migration preserves existing URLs and can safely run twice', async () => {
  await client`drop table news_slug_aliases`
  const [existing]=await client`insert into news (title,content,slug) values ('Existing','Body','existing-before-migration') returning id`
  const migration=readFileSync('drizzle/0005_preserve_article_urls.sql','utf8')
  await client.unsafe(migration)
  await client.unsafe(migration)
  const [alias]=await client`select news_id from news_slug_aliases where slug='existing-before-migration'`
  assert.equal(alias.news_id,existing.id)
})

test('publication dates are set on publish and retained after edits', async () => {
  const story=await newsRepository.create(article('publication-test'))
  assert.equal(story.published_at,null)
  const published=await newsRepository.update(story.id,{is_published:true})
  assert.ok(published?.published_at)
  const edited=await newsRepository.update(story.id,{title:'Edited',published_at:null})
  assert.equal(String(edited?.published_at),String(published.published_at))
})

test('old slugs resolve to the current article after multiple edits', async () => {
  const story=await newsRepository.create(article('old-link'))
  await newsRepository.update(story.id,{slug:'middle-link'})
  await newsRepository.update(story.id,{slug:'current-link'})
  for(const slug of ['old-link','middle-link','current-link']) {
    const result=await newsRepository.findById(slug)
    assert.equal(result?.id,story.id)
    assert.equal(result?.slug,'current-link')
  }
  assert.equal(await newsRepository.isSlugExists('old-link'),true)
  assert.equal(await newsRepository.isSlugExists('old-link',story.id),false)
})

test('a different article cannot take over a previously shared URL', async () => {
  const owner=await newsRepository.findById('old-link')
  const result=await newsService.createNews(article('old-link'))
  assert.equal(result.error,null)
  assert.notEqual(result.data?.slug,'old-link')
  assert.equal((await newsRepository.findById('old-link'))?.id,owner?.id)
})

test('concurrent attempts to claim one new slug cannot steal another article URL', async () => {
  const a=await newsRepository.create(article('race-a'))
  const b=await newsRepository.create(article('race-b'))
  const result=await Promise.allSettled([newsRepository.update(a.id,{slug:'contested-slug'}),newsRepository.update(b.id,{slug:'contested-slug'})])
  assert.equal(result.filter(r=>r.status==='fulfilled').length,1)
  assert.equal((await newsRepository.findById('race-a'))?.id,a.id)
  assert.equal((await newsRepository.findById('race-b'))?.id,b.id)
})

test('slow database queries are cancelled before the hosting timeout', async () => {
  const start = Date.now()
  await assert.rejects(client`select pg_sleep(11)`, (error: any) => error.code === '57014')
  assert.ok(Date.now() - start < 11000)
  const [recovered] = await client`select 1 as ok`
  assert.equal(recovered.ok, 1)
})
