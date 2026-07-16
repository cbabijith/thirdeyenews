'use client'

import { useRouter } from 'next/navigation'
import { AdForm } from '@/features/ads/components/AdForm'
import type { AdPosition } from '@/features/ads/types'

export function NewAdClient() {
  const router = useRouter()

  const handleSubmit = async (formData: {
    title: string
    image_url: string | null
    link_url: string | null
    youtube_link: string | null
    position: 'main_banner' | 'bottom_nav'
    display_order: number
    is_active: boolean
  }) => {
    const res = await fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.title,
        image_url: formData.image_url || null,
        link_url: formData.link_url || null,
        youtube_link: formData.youtube_link || null,
        position: formData.position,
        display_order: formData.display_order,
        is_active: formData.is_active,
      }),
    })
    const json = await res.json()
    if (json.error) {
      alert(json.error)
      return
    }
    router.push('/content/ads')
    router.refresh()
  }

  const handleCancel = () => {
    router.push('/content/ads')
  }

  return <AdForm onSubmit={handleSubmit} onCancel={handleCancel} />
}
