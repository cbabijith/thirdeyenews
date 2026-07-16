'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { api, NewsItem } from '@/lib/api'
import { Header } from '@/components/Header'
import { ShareButton } from '@/components/ShareButton'
import { AdBanner } from '@/components/AdBanner'
import { Footer } from '@/components/Footer'
import { useThemeStore } from '@/store/themeStore'
import { formatMalayalamDate, formatShortDate } from '@/lib/dateFormat'

interface RelatedNews {
  id: string
  title: string
  slug?: string | null
  image_url?: string | null
  published_at?: string | null
  categories?: {
    name: string
  }
}

interface NewsDetailClientProps {
  news: NewsItem
  relatedNews: RelatedNews[]
  adjacentNews: {
    prev: NewsItem | null
    next: NewsItem | null
  }
}

const getYouTubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : ''
}

function renderAdHtml(imageUrl: string, linkUrl?: string | null): string {
  const imgHtml = `<img src="${imageUrl}" alt="Advertisement" class="w-full h-auto rounded-xl my-4 block object-cover max-h-[300px]" style="border-radius: 0.75rem; margin-top: 1rem; margin-bottom: 1rem; display: block; width: 100%; height: auto; object-fit: cover; max-height: 300px;" />`
  if (linkUrl) {
    return `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="display: block; width: 100%;">${imgHtml}</a>`
  }
  return imgHtml
}

function getContentWithAd(content: string, adImageUrl?: string | null, adLinkUrl?: string | null): string {
  if (!adImageUrl) return content

  const closingTag = '</p>'
  const index = content.indexOf(closingTag)
  if (index === -1) {
    return content + renderAdHtml(adImageUrl, adLinkUrl)
  }

  const insertPosition = index + closingTag.length
  return content.slice(0, insertPosition) + renderAdHtml(adImageUrl, adLinkUrl) + content.slice(insertPosition)
}

export function NewsDetailClient({ news: initialNews, relatedNews = [], adjacentNews }: NewsDetailClientProps) {
  const { colors } = useThemeStore()
  const router = useRouter()
  const news = initialNews
  const pathname = usePathname()
  const viewCountedRef = useRef(false)

  useEffect(() => {
    if (news.slug && pathname !== `/news/${news.slug}`) {
      router.replace(`/news/${news.slug}`)
    }
  }, [news.slug, pathname, router])

  useEffect(() => {
    if (typeof window !== 'undefined' && !viewCountedRef.current) {
      viewCountedRef.current = true
      const storageKey = `viewed_${initialNews.id}`
      const hasViewed = sessionStorage.getItem(storageKey)
      if (!hasViewed) {
        sessionStorage.setItem(storageKey, 'true')
        api.incrementView(initialNews.id)
      }
    }
  }, [initialNews.id])

  const handleShare = async () => {
    if (typeof window === 'undefined' || !news) return

    const newsUrl = `https://thirdeyenewslive.com/news/${news.slug || news.id}`

    const normalizeMalayalam = (text: string) => {
      if (!text) return text
      return text
        .replace(/\u0D23\u0D4D\u200D/g, '\u0D7A') // ണ + ് + ZWJ -> ൺ
        .replace(/\u0D28\u0D4D\u200D/g, '\u0D7B') // ന + ് + ZWJ -> ൻ
        .replace(/\u0D30\u0D4D\u200D/g, '\u0D7C') // ര + ് + ZWJ -> ർ
        .replace(/\u0D32\u0D4D\u200D/g, '\u0D7D') // ല + ് + ZWJ -> ൽ
        .replace(/\u0D33\u0D4D\u200D/g, '\u0D7E') // ള + ് + ZWJ -> ൾ
    }

    const boldTitle = normalizeMalayalam(news.title)
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `*${line}*`)
      .join('\n')

    const shareText = `${boldTitle}\n\n${newsUrl}\n\n🔴 വാർത്തകൾ ഡെയ്ലി ഹണ്ടിൽ വായിക്കുവാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക\nhttps://profile.dailyhunt.in/thirdeyenewslive\n\n📢 വാർത്തകൾ വാട്സ് ആപ്പിൽ അതിവേഗമറിയാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക\nhttps://chat.whatsapp.com/EDpxcoLm36sGvoGLYlv4b9`

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
    ? formatMalayalamDate(news.published_at)
    : ''

  const authorName = news.profiles?.full_name || 'സ്റ്റാഫ് റിപ്പോർട്ടർ'
  const formatDateShort = (date: string) => formatShortDate(date)


  return (
    <div className={`min-h-screen ${colors.background}`}>
      <Header />

      <main className="w-full max-w-[700px] mx-auto px-4 md:px-6 pt-3 md:pt-5 pb-8 flex flex-col gap-3 md:gap-4">
        {/* Back + Category Row */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            prefetch={false}
            className="inline-flex items-center gap-1 text-on-surface-variant text-[13px] font-medium hover:text-on-surface transition-colors min-h-[44px]"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            തിരികെ
          </Link>
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
        <div className="flex items-center gap-2 text-[12px] text-on-surface-variant flex-wrap">
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
        </div>

        {/* Featured Image */}
        {news.image_url && (
          <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-surface-container mt-1">
            <Image
              src={news.image_url}
              alt={news.title}
              fill
              priority
              sizes="(max-w-[700px]) 100vw, 700px"
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
              <p className="font-semibold text-black dark:text-white text-[15px] md:text-[16px] leading-relaxed text-left">{news.description}</p>
            </div>
          )}
          {news.content && (
            <>
              <style dangerouslySetInnerHTML={{ __html: `
                .news-content-area,
                .news-content-area * {
                  color: #000000 !important;
                  text-align: left !important;
                }
                .news-content-area a {
                  color: #2563eb !important;
                  text-decoration: underline;
                  cursor: pointer;
                }
                .news-content-area a:hover {
                  color: #1d4ed8 !important;
                }
                html.dark .news-content-area,
                html.dark .news-content-area *,
                .dark .news-content-area,
                .dark .news-content-area * {
                  color: #ffffff !important;
                }
                html.dark .news-content-area a,
                .dark .news-content-area a {
                  color: #60a5fa !important;
                }
                html.dark .news-content-area a:hover,
                .dark .news-content-area a:hover {
                  color: #93c5fd !important;
                }
              ` }} />
              <div 
                className="news-content-area leading-relaxed text-[16px] md:text-[17px]" 
                dangerouslySetInnerHTML={{ __html: getContentWithAd(news.content, news.ad_image_url, news.ad_link_url) }} 
              />
            </>
          )}
        </article>

        {/* Ad Banners */}
        <div className="w-full pt-2">
          <AdBanner maxAds={3} />
        </div>

        {/* Adjacent News Navigation */}
        {adjacentNews && (adjacentNews.prev || adjacentNews.next) && (
          <section className="w-full flex flex-col gap-3 pt-4 border-t border-border mt-2">
            {adjacentNews.next && (
              <Link
                href={`/news/${adjacentNews.next.slug || adjacentNews.next.id}`}
                prefetch={false}
                className="group flex flex-col justify-between p-4 rounded-xl border border-border bg-surface-container hover:bg-surface-container-high transition-all duration-300 min-h-[80px]"
              >
                <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider mb-1">
                  അടുത്ത വാർത്ത
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
                <h4 className="text-[13px] md:text-[14px] font-bold text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {adjacentNews.next.title}
                </h4>
              </Link>
            )}

            {adjacentNews.prev && (
              <Link
                href={`/news/${adjacentNews.prev.slug || adjacentNews.prev.id}`}
                prefetch={false}
                className="group flex flex-col justify-between p-4 rounded-xl border border-border bg-surface-container hover:bg-surface-container-high transition-all duration-300 min-h-[80px]"
              >
                <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider mb-1">
                  <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  മുൻപത്തെ വാർത്ത
                </div>
                <h4 className="text-[13px] md:text-[14px] font-bold text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {adjacentNews.prev.title}
                </h4>
              </Link>
            )}
          </section>
        )}

        {/* Related Articles */}
        {relatedNews && relatedNews.length > 0 && (
          <section className="w-full pt-4">
            <h3 className="text-on-surface text-[14px] font-bold mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              ബന്ധപ്പെട്ട വാർത്തകൾ
            </h3>
            <div className="flex flex-col">
              {relatedNews.map((item, index) => (
                <Link key={item.id} href={`/news/${item.slug || item.id}`} prefetch={false} className="block group">
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

      <ShareButton onShare={handleShare} />

      <Footer />
    </div>
  )
}
