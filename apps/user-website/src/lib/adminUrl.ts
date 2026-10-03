// The proxy routes may only talk to these admin API origins. When
// ADMIN_API_URL points somewhere new, add that origin here — requests to any
// other origin are rejected before a network call is made.
const ALLOWED_ORIGINS = [
  'https://admin.thirdeyenewslive.com',
  'http://localhost:3000',
  'http://localhost:3001',
]

export function toAdminUrl(pathAndQuery: string): URL {
  const base = process.env.ADMIN_API_URL || 'https://admin.thirdeyenewslive.com'
  const url = new URL(pathAndQuery, base)
  if (!ALLOWED_ORIGINS.includes(url.origin)) {
    throw new Error('Blocked untrusted admin API origin: ' + url.origin)
  }
  return url
}
