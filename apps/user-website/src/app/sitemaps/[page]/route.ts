import { sitemapPage, xmlResponse } from '@/lib/sitemap'
export const revalidate = 60
export async function GET(_req: Request, { params }: { params: Promise<{ page: string }> }) {
  const { page } = await params
  if (!/^\d+\.xml$/.test(page)) return new Response('Not found', { status: 404 })
  const number = Number(page.slice(0, -4))
  if (!Number.isSafeInteger(number) || number > 10000) return new Response('Not found', { status: 404 })
  try {
    const body = await sitemapPage(number)
    return body ? xmlResponse(body) : new Response('Not found', { status: 404 })
  } catch (error) {
    console.error('Sitemap unavailable', error)
    return new Response('Sitemap temporarily unavailable', { status: 503, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' } })
  }
}
