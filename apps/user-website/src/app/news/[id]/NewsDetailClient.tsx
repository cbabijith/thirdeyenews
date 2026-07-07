'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import supabase from '@thirdeyenews/shared-supabase'
import { Header } from '@/components/Header'
import { BottomNavBar } from '@/components/BottomNavBar'
import { ShareButton } from '@/components/ShareButton'
import { AdBanner } from '@/components/AdBanner'
import { ShimmerBox } from '@/components/Shimmer'
import { Footer } from '@/components/Footer'
import { useThemeStore } from '@/store/themeStore'
import DOMPurify from 'isomorphic-dompurify'

interface NewsItem {
  id: string
  title: string
  content: string
  description?: string
  image_url?: string
  youtube_link?: string
  published_at?: string
  is_pinned?: boolean
  view_count?: number
  categories?: {
    name: string
    slug: string
  }
  profiles?: {
    full_name?: string
  }
}

interface RelatedNews {
  id: string
  title: string
  image_url?: string
  published_at?: string
  categories?: {
    name: string
  }
}

interface NewsDetailClientProps {
  news: NewsItem
  relatedNews: RelatedNews[]
}

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return ''
  if (url.includes('embed/')) return url
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1].split('?')[0]
    return `https://www.youtube.com/embed/${id}`
  }
  if (url.includes('watch?v=')) {
    const id = url.split('watch?v=')[1].split('&')[0]
    return `https://www.youtube.com/embed/${id}`
  }
  return url
}

export function NewsDetailClient({ news: initialNews, relatedNews: initialRelated }: NewsDetailClientProps) {
  const { colors } = useThemeStore()
  const router = useRouter()
  const [news, setNews] = useState<NewsItem>(initialNews)
  const [relatedNews] = useState<RelatedNews[]>(initialRelated)
  const viewCountedRef = useRef(false)

  useEffect(() => {
    if (!viewCountedRef.current) {
      viewCountedRef.current = true
      supabase.rpc('increment_news_view', { news_id: initialNews.id }).then(({ error }) => {
        if (error) console.error('Failed to increment view:', error)
      })
    }
  }, [initialNews.id])

  const handleShare = async () => {
    if (typeof window === 'undefined' || !news) return

    const category = news.categories?.name || 'ബ്രേക്കിംഗ് ന്യൂസ്'

    const newsUrl = window.location.href
    const publishedDate = news.published_at
      ? new Date(news.published_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : ''

    const shareText = `📰 *ThirdEye News* | ${category}

✍️ *${news.title}*

👉 *മുഴുവൻ വാർത്ത വായിക്കാൻ:*
${newsUrl}

📅 ${publishedDate}

━━━━━━━━━━━━━━━

📲 *ThirdEye News വാട്സ്ആപ്പ് ചാനലിൽ ചേരൂ*

കേരളത്തിലെയും ലോകത്തെയും പ്രധാന വാർത്തകൾ, ബ്രേക്കിംഗ് അപ്ഡേറ്റുകൾ, പ്രത്യേക റിപ്പോർട്ടുകൾ എന്നിവ അതിവേഗം ലഭിക്കാൻ ഞങ്ങളുടെ വാട്സ്ആപ്പ് ചാനലിൽ ഇപ്പോൾ തന്നെ ജോയിൻ ചെയ്യൂ

👇 *ചാനലിൽ ചേരാൻ*
https://chat.whatsapp.com/B6JGw1jqCMeFBABRYql9MV?mode=ems_copy_t

━━━━━━━━━━━━━━━
*ThirdEye News*
സത്യസന്ധവും വേഗമേറിയതുമായ വാർത്തകൾ 🌐 www.thirdeyenews.com`

    const fallbackToWhatsApp = () => {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
      window.open(whatsappUrl, '_blank')
    }

    const canShareFiles = typeof navigator !== 'undefined' && typeof navigator.share === 'function' && typeof navigator.canShare === 'function'

    if (canShareFiles && news.image_url) {
      try {
        const response = await fetch(news.image_url)
        const blob = await response.blob()
        const file = new File([blob], 'thirdeyenews.jpg', { type: blob.type || 'image/jpeg' })

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            text: shareText,
            files: [file],
          })
          return
        }
      } catch (err) {
        console.error('Web Share with image failed, falling back:', err)
      }
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text: shareText })
        return
      } catch (err) {
        console.error('Web Share text failed, falling back:', err)
      }
    }

    fallbackToWhatsApp()
  }

  const formattedDate = news.published_at
    ? new Date(news.published_at).toLocaleDateString('ml-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  const authorName = news.profiles?.full_name || 'സ്റ്റാഫ് റിപ്പോർട്ടർ'
  const formatDateShort = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const sanitizedContent = news.content ? DOMPurify.sanitize(news.content) : ''

  return (
    <div className={`min-h-screen ${colors.background}`}>
      <Header />

      <main className="w-full max-w-[700px] mx-auto px-4 md:px-6 pt-3 md:pt-5 pb-8 flex flex-col gap-3 md:gap-4">
        {/* Back + Category Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-on-surface-variant text-[12px] font-medium hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            തിരികെ
          </button>
          {news.categories && (
            <span className="text-secondary text-[10px] font-semibold uppercase tracking-wide">
              {news.categories.name}
            </span>
          )}
        </div>

        {/* Headline */}
        <h1 className="text-[20px] md:text-[28px] font-bold leading-[1.35] text-on-surface">
          {news.title}
        </h1>

        {/* Metadata Row */}
        <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
          {news.published_at && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">schedule</span>
              {formattedDate}
            </span>
          )}
          <span className="w-1 h-1 rounded-full bg-outline"></span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">person</span>
            {authorName}
          </span>
          {news.view_count !== undefined && news.view_count > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-outline"></span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">visibility</span>
                {news.view_count}
              </span>
            </>
          )}
        </div>

        {/* Featured Image */}
        {news.image_url && (
          <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-surface-container mt-1 relative">
            <Image
              src={news.image_url}
              alt={news.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover"
            />
          </div>
        )}

        {/* YouTube Video */}
        {news.youtube_link && (
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black mt-1">
            <iframe
              className="w-full h-full"
              src={getYouTubeEmbedUrl(news.youtube_link)}
              title={news.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Article Content */}
        <article className="w-full mt-2">
          {news.description && (
            <div className="border-l-[3px] border-secondary pl-4 mb-5">
              <p className="font-semibold text-on-surface text-[15px] md:text-[16px] leading-relaxed" style={{ textAlign: 'justify', textAlignLast: 'left', textJustify: 'inter-word', wordSpacing: '0.05em' }}>{news.description}</p>
            </div>
          )}
          {sanitizedContent && (
            <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          )}
        </article>

        {/* Ad Banners */}
        <div className="w-full pt-2">
          <AdBanner maxAds={3} />
        </div>

        {/* Related Articles */}
        {relatedNews.length > 0 && (
          <section className="w-full pt-4">
            <h3 className="text-on-surface text-[14px] font-bold mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              ബന്ധപ്പെട്ട വാർത്തകൾ
            </h3>
            <div className="flex flex-col">
              {relatedNews.map((item, index) => (
                <Link key={item.id} href={`/news/${item.id}`} className="block group">
                  <div className={`flex gap-3 py-2.5 ${index !== relatedNews.length - 1 ? 'border-b border-border' : ''}`}>
                    {item.image_url && (
                      <div className="relative w-14 h-14 flex-shrink-0">
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          sizes="56px"
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div className="flex flex-col justify-center flex-1 min-w-0 gap-1">
                      <h4 className="text-[13px] font-medium text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      {item.published_at && (
                        <span className="text-on-surface-variant text-[10px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[11px]">schedule</span>
                          {formatDateShort(item.published_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNavBar />
      <ShareButton onShare={handleShare} />

      <Footer />
    </div>
  )
}
