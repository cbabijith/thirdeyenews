// Revalidation may only target these user-website origins; anything else is
// rejected before a network call is made.
const ALLOWED_USER_ORIGINS = [
  'http://localhost:3001',
  'http://localhost:3000',
  'https://thirdeyenewslive.com',
  'https://www.thirdeyenewslive.com',
]

function toUserWebsiteUrl(pathAndQuery: string): URL {
  const base = process.env.USER_WEBSITE_URL || process.env.NEXT_PUBLIC_USER_WEBSITE_URL || ALLOWED_USER_ORIGINS[0]
  const url = new URL(pathAndQuery, base)
  if (!ALLOWED_USER_ORIGINS.includes(url.origin)) {
    throw new Error('Blocked untrusted user website origin: ' + url.origin)
  }
  return url
}

export async function triggerRevalidation(slugOrId: string) {
  try {
    const token = process.env.API_ACCESS_TOKEN || 'thirdeye_secure_token_9f8e7d6c5b4a3a2b1'

    // Revalidate the specific news page
    const resDetail = await fetch(toUserWebsiteUrl('/api/revalidate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: `/news/${slugOrId}`, token }),
    })
    const jsonDetail = await resDetail.json()
    console.log(`Revalidation response for /news/${slugOrId}:`, jsonDetail)

    // Revalidate the home page to update listing feeds
    const resHome = await fetch(toUserWebsiteUrl('/api/revalidate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '/', token }),
    })
    const jsonHome = await resHome.json()
    console.log('Revalidation response for /:', jsonHome)
  } catch (err) {
    console.error('Failed to trigger revalidation:', err)
  }
}
