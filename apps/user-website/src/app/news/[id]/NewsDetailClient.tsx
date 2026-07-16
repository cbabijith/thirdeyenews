'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { api, NewsItem, Category, Ad } from '@/lib/api'
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
  categories?: Category[]
  ads?: Ad[]
}

const getYouTubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : ''
}

function renderAdHtml(ad: { image_url?: string | null; link_url?: string | null; youtube_link?: string | null }): string {
  if (ad.youtube_link) {
    const embedUrl = getYouTubeEmbedUrl(ad.youtube_link)
    if (embedUrl) {
      return `<div style="margin: 1rem 0; border-radius: 0.75rem; overflow: hidden; aspect-ratio: 16/9;"><iframe src="${embedUrl}" style="width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
    }
  }
  if (ad.image_url) {
    const imgHtml = `<img src="${ad.image_url}" alt="Advertisement" class="w-full h-auto rounded-xl my-4 block object-cover max-h-[300px]" style="border-radius: 0.75rem; margin-top: 1rem; margin-bottom: 1rem; display: block; width: 100%; height: auto; object-fit: cover; max-height: 300px;" />`
    if (ad.link_url) {
      return `<a href="${ad.link_url}" target="_blank" rel="noopener noreferrer" style="display: block; width: 100%;">${imgHtml}</a>`
    }
    return imgHtml
  }
  return ''
}

function getContentWithAds(
  content: string,
  newsAdImage?: string | null,
  newsAdLink?: string | null,
  globalAds: Ad[] = []
): string {
  if (newsAdImage) {
    const adHtml = renderAdHtml({ image_url: newsAdImage, link_url: newsAdLink })
    if (!adHtml) return content
    const closingTag = '</p>'
    const index = content.indexOf(closingTag)
    if (index === -1) {
      return content + adHtml
    }
    const insertPosition = index + closingTag.length
    return content.slice(0, insertPosition) + adHtml + content.slice(insertPosition)
  }

  if (!globalAds || !globalAds.length) return content
  const activeAds = globalAds.slice(0, 3)

  let result = content
  let searchFrom = 0

  for (let i = 0; i < activeAds.length; i++) {
    const ad = activeAds[i]
    const adHtml = renderAdHtml(ad)
    if (!adHtml) continue

    const closingTag = '</p>'
    const index = result.indexOf(closingTag, searchFrom)
    if (index === -1) {
      result = result + adHtml
      break
    }
    const insertPosition = index + closingTag.length
    result = result.slice(0, insertPosition) + adHtml + result.slice(insertPosition)
    searchFrom = insertPosition + adHtml.length
  }

  return result
}

export function NewsDetailClient({ news: initialNews, relatedNews = [], adjacentNews, categories, ads }: NewsDetailClientProps) {
  const { colors } = useThemeStore()
  const news = initialNews
  const viewCountedRef = useRef(false)

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

    const shareText = `${boldTitle}\n\n${newsUrl}\n\n🔴 വാർത്തകൾ ഡെയ്ലി ഹണ്ടിൽ വായിക്കുവാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക\nhttps://profile.dailyhunt.in/thirdeyenewslive\n\n📢 വാർത്തകൾ വാട്സ് ആപ്പിൽ അതിവേഗമറിയാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക\nhttps://chat.whatsapp.com/K87BAlQ3O3g6AW6SOuETY3?s=cl&p=a&ilr=4`

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
      <Header categories={categories} />

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
          <div className="w-full rounded-xl overflow-hidden bg-surface-container mt-1">
            <img
              src={news.image_url}
              alt={news.title}
              className="w-full h-auto block"
              loading="eager"
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
                dangerouslySetInnerHTML={{ __html: getContentWithAds(news.content, news.ad_image_url, news.ad_link_url, ads) }} 
              />
            </>
          )}
        </article>

        {/* Ad Banners */}
        <div className="w-full pt-2">
          <AdBanner maxAds={3} ads={ads?.filter(ad => !ad.youtube_link)} />
        </div>

        {/* Adjacent News Navigation */}
        {adjacentNews && (adjacentNews.prev || adjacentNews.next) && (
          <section className="w-full flex flex-col gap-3 pt-6 border-t border-border mt-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 mb-1">
              Continue Reading
            </h3>

            {adjacentNews.next && (
              <Link
                href={`/news/${adjacentNews.next.slug || adjacentNews.next.id}`}
                prefetch={false}
                className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-container hover:border-[#cc0000]/30 hover:bg-surface-container-high transition-all duration-300"
              >
                {adjacentNews.next.image_url && (
                  <img
                    src={adjacentNews.next.image_url}
                    alt={adjacentNews.next.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    loading="lazy"
                  />
                )}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[#cc0000]">
                    <span className="font-bold text-[11px] uppercase tracking-wider">അടുത്ത വാർത്ത</span>
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                  <h4 className="text-[14px] font-bold text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {adjacentNews.next.title}
                  </h4>
                </div>
              </Link>
            )}

            {adjacentNews.prev && (
              <Link
                href={`/news/${adjacentNews.prev.slug || adjacentNews.prev.id}`}
                prefetch={false}
                className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-container hover:border-[#cc0000]/30 hover:bg-surface-container-high transition-all duration-300"
              >
                <div className="flex flex-col gap-1 min-w-0 flex-1 items-end text-right">
                  <div className="flex items-center gap-1.5 text-[#cc0000]">
                    <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span className="font-bold text-[11px] uppercase tracking-wider">മുൻപത്തെ വാർത്ത</span>
                  </div>
                  <h4 className="text-[14px] font-bold text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {adjacentNews.prev.title}
                  </h4>
                </div>
                {adjacentNews.prev.image_url && (
                  <img
                    src={adjacentNews.prev.image_url}
                    alt={adjacentNews.prev.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    loading="lazy"
                  />
                )}
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
