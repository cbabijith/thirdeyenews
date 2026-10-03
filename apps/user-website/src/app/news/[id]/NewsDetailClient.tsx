'use client'

import { useRef, useEffect, useState, type ReactNode } from 'react'
import { readStorage, writeStorage } from '@/lib/browserStorage'
import Link from 'next/link'
import { NewsImage as Image } from '@/components/NewsImage'
import { api, NewsItem, Category, Ad } from '@/lib/api'
import { Header } from '@/components/Header'
import { ShareButton } from '@/components/ShareButton'
import { AdBanner } from '@/components/AdBanner'
import { Footer } from '@/components/Footer'
import { useThemeStore } from '@/store/themeStore'
import { articleUrl, mediaUrl } from '@/lib/site'
import { formatMalayalamDate } from '@/lib/dateFormat'

interface NewsDetailClientProps {
  news: NewsItem
  categories?: Category[]
  children?: ReactNode
}

const getYouTubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : ''
}

// News in these categories renders without any ads on the detail page.
const AD_FREE_CATEGORY_SLUGS = ['classified', 'obituary']

function renderAdHtml(ad: { image_url?: string | null; link_url?: string | null; youtube_link?: string | null }): string {
  if (ad.youtube_link) {
    const embedUrl = getYouTubeEmbedUrl(ad.youtube_link)
    if (embedUrl) {
      return `<div style="margin: 1rem 0; border-radius: 0.75rem; overflow: hidden; aspect-ratio: 16/9;"><iframe src="${embedUrl}" style="width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
    }
  }
  if (ad.image_url) {
    const imgHtml = `<img src="${mediaUrl(ad.image_url)}" alt="Advertisement" class="w-full h-auto rounded-xl my-4 block object-cover max-h-[300px]" style="border-radius: 0.75rem; margin-top: 1rem; margin-bottom: 1rem; display: block; width: 100%; height: auto; object-fit: cover; max-height: 300px;" />`
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

export function NewsDetailClient({ news: initialNews, categories, children }: NewsDetailClientProps) {
  const { colors } = useThemeStore()
  const news = initialNews
  const viewCountedRef = useRef(false)
  const [ads, setAds] = useState<Ad[]>([])
  const isAdFreeCategory = AD_FREE_CATEGORY_SLUGS.includes((news.categories?.slug || '').toLowerCase())

  useEffect(() => {
    if (isAdFreeCategory) return
    let active = true
    void api.getAds('main_banner', 3).then(data => {
      if (active && Array.isArray(data)) setAds(data)
    }).catch(error => console.error('Optional article ads unavailable', error))
    return () => { active = false }
  }, [isAdFreeCategory, news.id])

  useEffect(() => {
    if (typeof window !== 'undefined' && !viewCountedRef.current) {
      viewCountedRef.current = true
      const storageKey = `viewed_${initialNews.id}`
      const hasViewed = readStorage('sessionStorage', storageKey)
      if (!hasViewed) {
        writeStorage('sessionStorage', storageKey, 'true')
        api.incrementView(initialNews.id)
      }
    }
  }, [initialNews.id])

  const handleShare = async () => {
    if (typeof window === 'undefined' || !news) return

    const newsUrl = articleUrl(news)

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

    const shareText = `${boldTitle}\n\n${newsUrl}\n\n🔴 വാർത്തകൾ ഡെയ്ലി ഹണ്ടിൽ വായിക്കുവാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക\nhttps://profile.dailyhunt.in/thirdeyenewslive\n\n📢 വാർത്തകൾ വാട്സ് ആപ്പിൽ അതിവേഗമറിയാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക\nhttps://chat.whatsapp.com/JyiIvGaujNs7poNwoRlxzv?s=sw&p=a&mlu=4`

    const fallbackToWhatsApp = () => {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
      window.open(whatsappUrl, '_blank')
    }

    const canShareFiles = typeof navigator !== 'undefined' && typeof navigator.share === 'function' && typeof navigator.canShare === 'function'

    if (canShareFiles && news.image_url) {
      try {
        const response = await fetch(mediaUrl(news.image_url))
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
            <Image
              width={1200}
              height={675}
              sizes="(max-width: 700px) 100vw, 700px"
              priority
              src={news.image_url}
              alt={news.title}
              className="w-full h-auto block"
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
                dangerouslySetInnerHTML={{ __html: isAdFreeCategory ? news.content : getContentWithAds(news.content, news.ad_image_url, news.ad_link_url, ads) }}
              />
            </>
          )}
        </article>

        {/* Ad Banners */}
        {!isAdFreeCategory && (
          <div className="w-full pt-2">
            <AdBanner maxAds={3} ads={ads?.filter(ad => !ad.youtube_link)} />
          </div>
        )}

        {children}
      </main>

      <ShareButton onShare={handleShare} />

      <Footer />
    </div>
  )
}
