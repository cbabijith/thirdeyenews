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

async function getNews(id: string): Promise<NewsItem | null> {
  try {
    const data = await api.getNewsById(id)
    if (!data) return null
    return data as unknown as NewsItem
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

  return {
    title: `${news.title} - ThirdEye വാർത്തകൾ`,
    description: description,
    openGraph: {
      title: news.title,
      description: description,
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
      siteName: 'ThirdEye വാർത്തകൾ',
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
