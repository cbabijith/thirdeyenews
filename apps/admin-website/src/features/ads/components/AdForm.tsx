'use client'

import { useState, useEffect } from 'react'
import { Ad, AdPosition } from '../types'
import { useStorage } from '@/hooks/useStorage'
import { X, Image as ImageIcon, ArrowLeft } from 'lucide-react'

interface AdFormProps {
  initialData?: Ad | null
  onSubmit: (data: {
    title: string
    image_url: string
    link_url: string
    position: AdPosition
    display_order: number
    is_active: boolean
  }) => Promise<void> | void
  onCancel: () => void
}

const POSITIONS: { value: AdPosition; label: string }[] = [
  { value: 'main_banner', label: 'Main Banner (Home & News Pages)' },
  { value: 'bottom_nav', label: 'Bottom Navigation Banner (Only 1 allowed)' },
]

export function AdForm({ initialData = null, onSubmit, onCancel }: AdFormProps) {
  const { uploading, uploadImage, deleteImage } = useStorage()
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    position: 'main_banner' as AdPosition,
    display_order: 0,
    is_active: true,
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        image_url: initialData.image_url || '',
        link_url: initialData.link_url || '',
        position: initialData.position || 'main_banner',
        display_order: initialData.display_order || 0,
        is_active: initialData.is_active ?? true,
      })
    }
  }, [initialData])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (formData.image_url) {
      await deleteImage(formData.image_url)
    }

    const result = await uploadImage(file, 'ads')
    if (result) {
      setFormData({ ...formData, image_url: result })
    }
  }

  const handleRemoveImage = async () => {
    if (formData.image_url) {
      await deleteImage(formData.image_url)
    }
    setFormData({ ...formData, image_url: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleCancel = () => {
    setShowCancelConfirm(true)
  }

  const confirmCancel = () => {
    setShowCancelConfirm(false)
    onCancel()
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[800px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleCancel}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          title="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {initialData ? 'Edit Ad' : 'New Ad'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
            placeholder="Ad title..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Position</label>
          <select
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value as AdPosition })}
            required
            className="w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
          >
            {POSITIONS.map((pos) => (
              <option key={pos.value} value={pos.value}>{pos.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Ad Image</label>
          {formData.image_url ? (
            <div className="relative inline-block">
              <img
                src={formData.image_url}
                alt="Ad preview"
                className="max-w-full max-h-64 rounded-lg object-contain border border-gray-200"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors ${uploading ? 'opacity-50' : ''}`}>
              <div className="flex flex-col items-center gap-2 text-gray-400">
                {uploading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    <span className="text-xs">Uploading & compressing...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-7 h-7" />
                    <span className="text-xs">Click to upload image</span>
                    <span className="text-[10px] text-gray-300">WebP · max 50KB</span>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Link URL <span className="text-gray-300 normal-case">(optional)</span></label>
          <input
            type="url"
            value={formData.link_url}
            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
            className="w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Display Order</label>
          <input
            type="number"
            min={0}
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
            placeholder="0"
          />
          <p className="text-xs text-gray-400 mt-1">Lower numbers appear first.</p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
          />
          <span className="text-sm text-gray-700">Active</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all disabled:opacity-50"
            disabled={uploading || !formData.image_url}
          >
            {initialData ? 'Save' : 'Create'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            Cancel
          </button>
        </div>
      </form>

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Discard changes?</h3>
              <button onClick={() => setShowCancelConfirm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to cancel? All your changes will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                Keep Editing
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
