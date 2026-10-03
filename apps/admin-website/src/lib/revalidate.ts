const ALLOWED_USER_ORIGINS = ['http://localhost:3001', 'http://localhost:3000', 'https://thirdeyenewslive.com', 'https://www.thirdeyenewslive.com']

export async function triggerRevalidation(slugOrId?: string): Promise<boolean> {
  try {
    const url = new URL('/api/revalidate', process.env.USER_WEBSITE_URL || 'https://thirdeyenewslive.com')
    if (!ALLOWED_USER_ORIGINS.includes(url.origin)) throw new Error('Invalid reader website origin')
    const token = process.env.REVALIDATION_TOKEN || process.env.API_ACCESS_TOKEN
    if (!token) throw new Error('Revalidation token is not configured')
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: slugOrId ? `/news/${encodeURIComponent(slugOrId)}` : '/', token }),
          signal: AbortSignal.timeout(3000), cache: 'no-store',
        })
        if (!response.ok) throw new Error(`Revalidation returned ${response.status}`)
        const result = await response.json()
        if (!result.revalidated) throw new Error('Revalidation was not acknowledged')
        return true
      } catch (error) { if (attempt === 1) throw error }
    }
  } catch (error) { console.error('Public cache refresh failed', error) }
  return false
}
