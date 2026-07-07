'use client'

import { useRouter } from 'next/navigation'
import { updateAdAction } from '@/app/actions/ads'
import { Ad } from '@/types'
import { AdForm } from '@/components/forms/AdForm'
import { useThemeStore } from '@/store/themeStore'

interface EditAdClientProps {
  ad: Ad
}

export function EditAdClient({ ad }: EditAdClientProps) {
  const router = useRouter()
  const { colors } = useThemeStore()

  const handleSubmit = async (formData: {
    title: string
    image_url: string
    link_url: string
    position: 'main_banner' | 'bottom_nav'
    display_order: number
    is_active: boolean
  }) => {
    const result = await updateAdAction(ad.id, {
      title: formData.title,
      image_url: formData.image_url,
      link_url: formData.link_url || null,
      position: formData.position,
      display_order: formData.display_order,
      is_active: formData.is_active,
    })

    if (result.error) {
      alert(result.error)
      return
    }

    router.push('/content/ads')
    router.refresh()
  }

  const handleCancel = () => {
    router.push('/content/ads')
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={handleCancel}
          className={`p-2 rounded-lg border ${colors.border} ${colors.text} hover:bg-gray-100 transition-all flex items-center justify-center`}
          title="Go Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 className={`text-3xl font-bold ${colors.text}`}>Edit Ad</h1>
      </div>
      <AdForm
        initialData={ad}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}
