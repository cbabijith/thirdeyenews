export const SITE_URL = 'https://thirdeyenewslive.com'
export const articlePath = (news: { id: string; slug?: string | null }) => `/news/${encodeURIComponent(news.slug || news.id)}`
export const articleUrl = (news: { id: string; slug?: string | null }) => `${SITE_URL}${articlePath(news)}`

export function mediaUrl(value?: string | null): string {
  if (!value) return '/logo.svg'
  if (value.startsWith('/') && !value.startsWith('//')) return value
  try {
    const url = new URL(value)
    if (!['https:', 'http:'].includes(url.protocol)) return '/logo.svg'
    const origin = process.env.NEXT_PUBLIC_MEDIA_ORIGIN
    if (origin && url.hostname === 'pub-97fd80f978a242f6ad98240e478fe547.r2.dev') {
      return new URL(url.pathname, origin).href
    }
    return url.href
  } catch { return '/logo.svg' }
}
