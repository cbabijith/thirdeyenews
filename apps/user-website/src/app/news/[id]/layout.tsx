import { Metadata } from 'next'
import { api } from '@/lib/api'

interface NewsItem {
  id: string
  title: string
  content?: string | null
  description?: string | null
  image_url?: string | null
  published_at?: string | null
  categories?: {
    name: string
  }
}

const metaCache = new Map<string, { data: NewsItem | null; ts: number }>()
const CACHE_TTL = 60_000

async function getNews(id: string): Promise<NewsItem | null> {
  const cached = metaCache.get(id)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data
  }
  try {
    const data = await api.getNewsById(id)
    if (!data) {
      metaCache.set(id, { data: null, ts: Date.now() })
      return null
    }
    const item = data as unknown as NewsItem
    metaCache.set(id, { data: item, ts: Date.now() })
    return item
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const news = await getNews(resolvedParams.id)

  if (!news) {
    return {
      title: 'News Not Found - ThirdEye വാർത്തകൾ',
      description: 'The requested news article could not be found.',
    }
  }

  const description = news.description || news.content?.replace(/<[^>]*>/g, '').substring(0, 160) || ''
  const imageUrl = news.image_url || ''
  const url = `https://thirdeyenewslive.com/news/${resolvedParams.id}`

  return {
    title: `${news.title} - ThirdEye News`,
    description: description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: news.title,
      description: description,
      url: url,
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: news.title,
        }
      ] : [],
      type: 'article',
      publishedTime: news.published_at || undefined,
      siteName: 'ThirdEye News',
      locale: 'ml_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: news.title,
      description: description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
