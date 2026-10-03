import { api } from './api'
import { articleUrl, SITE_URL } from './site'

export const escapeXml = (value: string) => value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char]!))
export const xmlResponse = (body: string) => new Response(`<?xml version="1.0" encoding="UTF-8"?>${body}`, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-cache' } })

export async function sitemapIndex() {
  const data = await api.getSitemapPage(0)
  const pages = Math.max(1, Math.ceil(data.total / 1000))
  return `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Array.from({ length: pages }, (_, page) => `<sitemap><loc>${SITE_URL}/sitemaps/${page}.xml</loc></sitemap>`).join('')}</sitemapindex>`
}

export async function sitemapPage(page: number) {
  const data = await api.getSitemapPage(page)
  if (page > 0 && page * 1000 >= data.total) return null
  const links = page === 0 ? [SITE_URL, ...data.categories.map(category => `${SITE_URL}/?category=${encodeURIComponent(category.id)}`)] : []
  return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${links.map(url => `<url><loc>${escapeXml(url)}</loc></url>`).join('')}${data.articles.map(article => `<url><loc>${escapeXml(articleUrl(article))}</loc><lastmod>${new Date(article.updated_at).toISOString()}</lastmod></url>`).join('')}</urlset>`
}
