import { ShimmerBox } from '@/components/Shimmer'

export default function NewsDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header placeholder */}
      <header className="w-full h-14 border-b border-border/40 bg-surface flex items-center justify-between px-4">
        <ShimmerBox className="w-24 h-6 rounded" />
        <ShimmerBox className="w-8 h-8 rounded-full" />
      </header>

      <main className="w-full max-w-[700px] mx-auto px-4 md:px-6 pt-3 md:pt-5 pb-8 flex flex-col gap-4">
        {/* Back + Category Row */}
        <div className="flex items-center justify-between">
          <ShimmerBox className="w-16 h-4 rounded" />
          <ShimmerBox className="w-20 h-3 rounded" />
        </div>

        {/* Headline */}
        <div className="flex flex-col gap-2">
          <ShimmerBox className="w-full h-7 md:h-9 rounded" />
          <ShimmerBox className="w-5/6 h-7 md:h-9 rounded" />
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-3">
          <ShimmerBox className="w-32 h-3 rounded" />
          <ShimmerBox className="w-24 h-3 rounded" />
        </div>

        {/* Featured Image */}
        <ShimmerBox className="w-full h-64 rounded-xl mt-1" />

        {/* Article Content */}
        <div className="flex flex-col gap-3 mt-4">
          <ShimmerBox className="w-full h-4 rounded" />
          <ShimmerBox className="w-full h-4 rounded" />
          <ShimmerBox className="w-11/12 h-4 rounded" />
          <ShimmerBox className="w-full h-4 rounded" />
          <ShimmerBox className="w-5/6 h-4 rounded" />
        </div>
      </main>
    </div>
  )
}
