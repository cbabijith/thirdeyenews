import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
const base = process.env.READER_TEST_BASE_URL || 'http://localhost:4311'
if (new URL(base).hostname !== 'localhost') throw new Error('These tests require the local fixture website')
before(async () => {
  const response = await fetch(`${base}/api/revalidate`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:'/',token:'fixture-revalidate'})})
  assert.equal(response.status,200)
})


test('article text streams before slow optional recommendations', async () => {
  const start = Date.now()
  const result = await new Promise((resolve,reject)=>{
    let body = ''; let headline = 0
    http.get(`${base}/news/sample-story`,response=>{
      response.on('data',chunk=>{body += chunk; if(!headline && body.includes('<h1')) headline=Date.now()-start})
      response.on('end',()=>resolve({body,headline,finished:Date.now()-start,status:response.statusCode}))
    }).on('error',reject)
  })
  assert.equal(result.status,200)
  assert.ok(result.headline > 0)
  assert.ok(result.finished - result.headline > 1000, JSON.stringify({headline:result.headline,finished:result.finished}))
  assert.match(result.body,/Article body appears before recommendations/)
  assert.match(result.body,/Related story/)
  console.log(`Article headline arrived after ${result.headline}ms; optional content completed after ${result.finished}ms`)
  assert.match(result.body,/rel="canonical" href="https:\/\/thirdeyenewslive.com\/news\/sample-story"/)
  assert.match(result.body,/"@type":"NewsArticle"/)
})

test('homepage and direct category URL contain server rendered news links', async () => {
  for(const path of ['/', '/?category=b27cb936-eba8-4951-8cbe-8851f0ca4314']) {
    const response = await fetch(base+path); const html=await response.text()
    assert.equal(response.status,200)
    assert.match(html,/<a[^>]+href="\/news\/sample-story"/)
    assert.doesNotMatch(html,/BAILOUT_TO_CLIENT_SIDE_RENDERING/)
    assert.match(html,/<html lang="ml"/)
    if(path!=='/') assert.match(html,/Filtered Kerala story/)
  }
})

test('browser API distinguishes outages and missing articles', async () => {
  for(const [slug,status] of [['failed-story',503],['missing-story',404]]) {
    const response=await fetch(`${base}/api/news/${slug}`)
    assert.equal(response.status,status)
    assert.equal(response.headers.get('cache-control'),'no-store')
    assert.ok((await response.json()).error)
  }
})

test('UUID and old-slug visits redirect to the canonical story', async () => {
  for(const id of ['90f6f7c5-ec93-4196-8c70-b3b90321c47c','old-story']) {
    const response=await fetch(`${base}/news/${id}`,{redirect:'manual'});const html=await response.text()
    assert.ok(response.status===308 && response.headers.get('location')==='/news/sample-story' || /NEXT_REDIRECT;replace;\/news\/sample-story;308/.test(html))
  }
})

test('sitemap index and page expose published canonical URLs', async () => {
  const response=await fetch(`${base}/sitemap.xml`); const xml=await response.text()
  assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/application\/xml/)
  assert.match(xml,/<loc>https:\/\/thirdeyenewslive.com\/sitemaps\/0.xml<\/loc>/)
  const page=await fetch(`${base}/sitemaps/0.xml`);assert.equal(page.status,200)
  assert.match(await page.text(),/<loc>https:\/\/thirdeyenewslive.com\/news\/sample-story<\/loc>/)
  assert.equal((await fetch(`${base}/sitemaps/1.xml`)).status,404)
  assert.equal((await fetch(`${base}/sitemaps/invalid`)).status,404)
})

test('structured data cannot break out of its script element', async () => {
  const html=await (await fetch(`${base}/news/unsafe-json`)).text()
  const json=html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1]
  assert.ok(json);assert.doesNotMatch(json,/<\/script>/)
  assert.equal(JSON.parse(json).headline,'News </script><script>alert(1)</script>')
})

test('revalidation rejects unknown secrets and acknowledges the configured secret', async () => {
  for(const [token,status] of [['wrong',401],['fixture-revalidate',200]]) {
    const response=await fetch(`${base}/api/revalidate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:'/',token})})
    assert.equal(response.status,status)
  }
})
