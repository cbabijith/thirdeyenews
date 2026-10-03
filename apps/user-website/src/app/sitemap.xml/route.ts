import { sitemapIndex, xmlResponse } from '@/lib/sitemap'
export const revalidate = 60
export async function GET() {
  try { return xmlResponse(await sitemapIndex()) }
  catch (error) {
    console.error('Sitemap unavailable', error)
    return new Response('Sitemap temporarily unavailable', { status: 503, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' } })
  }
}
