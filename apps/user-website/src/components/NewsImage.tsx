import Image, { type ImageProps } from 'next/image'
import { mediaUrl } from '@/lib/site'

export function NewsImage(props: ImageProps) {
  const src = typeof props.src === 'string' ? mediaUrl(props.src) : props.src
  let optimized = typeof src !== 'string' || src.startsWith('/')
  if (typeof src === 'string' && !optimized) {
    const url = new URL(src)
    optimized = url.protocol === 'https:' && (url.hostname === 'assets.thirdeyenewslive.com' || /\.(r2\.dev|supabase\.co|cloudflarestorage\.com)$/.test(url.hostname))
  }
  // Older editorial URLs on other hosts must not throw during article rendering.
  return <Image {...props} src={src} unoptimized={props.unoptimized || !optimized} />
}
