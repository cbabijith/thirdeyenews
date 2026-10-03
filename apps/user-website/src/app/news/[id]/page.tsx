import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { cache, Suspense } from 'react'
import { api } from '@/lib/api'
import { ApiError } from '@/lib/http'
import { articlePath, articleUrl, mediaUrl, SITE_URL } from '@/lib/site'
import { NewsDetailClient } from './NewsDetailClient'
import { ArticleRecommendations } from './ArticleRecommendations'

export const revalidate = 60

const fetchNews = cache(async (id: string) => {
  const news = await api.getNewsById(id)
  if (!news || !news.is_published) return null
  if (typeof news.id !== 'string' || typeof news.title !== 'string' ||
      (news.content != null && typeof news.content !== 'string')) {
    throw new ApiError('Invalid article response', 502)
  }
  return news
})

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const news = await fetchNews((await params).id)
  if (!news) return { title: 'വാർത്ത കണ്ടെത്താനായില്ല', robots: { index: false, follow: true } }
  const description = news.description || news.content?.replace(/<[^>]*>/g, '').slice(0, 160) || news.title
  const image = mediaUrl(news.image_url)
  return {
    title: news.title,
    description,
    alternates: { canonical: articleUrl(news) },
    openGraph: {
      title: news.title, description, url: articleUrl(news), siteName: 'ThirdEye News',
      locale: 'ml_IN', type: 'article', images: [{ url: image, alt: news.title }],
      publishedTime: news.published_at || undefined, modifiedTime: news.updated_at || undefined,
    },
    twitter: { card: 'summary_large_image', title: news.title, description, images: [image] },
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const news = await fetchNews(id)
  if (!news) notFound()
  if (id !== (news.slug || news.id)) permanentRedirect(articlePath(news))
  const structuredData = {
    '@context': 'https://schema.org', '@type': 'NewsArticle',
    headline: news.title,
    description: news.description || undefined,
    image: news.image_url ? [mediaUrl(news.image_url)] : undefined,
    datePublished: news.published_at || undefined,
    dateModified: news.updated_at || undefined,
    inLanguage: 'ml', mainEntityOfPage: articleUrl(news),
    author: news.profiles?.full_name ? { '@type': 'Person', name: news.profiles.full_name } : { '@type': 'Organization', name: 'ThirdEye News', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'ThirdEye News', url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.svg` } },
  }
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
    <NewsDetailClient key={news.id} news={news}>
      <Suspense fallback={null}><ArticleRecommendations id={news.id} /></Suspense>
    </NewsDetailClient>
  </>
}
