import Link from 'next/link'
import { NewsImage as Image } from '@/components/NewsImage'
import { api } from '@/lib/api'
import { formatShortDate as formatDateShort } from '@/lib/dateFormat'

export async function ArticleRecommendations({ id }: { id: string }) {
  const [relatedNews, adjacentNews] = await Promise.all([
    api.getRelatedNews(id, 4).catch(() => []),
    api.getAdjacentNews(id).catch(() => null),
  ])
  return <>        {/* Adjacent News Navigation */}
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
</>
}
