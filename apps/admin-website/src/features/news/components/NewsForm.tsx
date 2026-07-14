'use client'

import { useState, useEffect, useRef } from 'react'
import type { Category, Subcategory } from '@/features/category/types'
import { News } from '../types'
import { useStorage } from '@/hooks/useStorage'
import dynamic from 'next/dynamic'
import { ArrowLeft, ImagePlus, X, Link as LinkIcon, Pin, Globe, FileText, Sparkles, ChevronDown, Loader2 } from 'lucide-react'

const RichTextEditor = dynamic(
  () => import('@/components/editor/RichTextEditor').then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-[450px] w-full border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center animate-pulse">
        <span className="text-sm text-gray-400 font-medium">Loading rich text editor...</span>
      </div>
    ),
  }
)

interface NewsFormProps {
  categories: Category[]
  subcategories?: Subcategory[]
  initialData?: News | null
  onSubmit: (data: {
    category_id: string
    subcategory_id: string
    title: string
    content: string
    image_url: string
    youtube_link: string
    is_published: boolean
    is_pinned: boolean
    published_at: string
    slug?: string | null
    ad_image_url?: string | null
    ad_link_url?: string | null
  }) => Promise<void> | void
  onCancel: () => void
}

export function NewsForm({
  categories,
  subcategories = [],
  initialData = null,
  onSubmit,
  onCancel
}: NewsFormProps) {
  const { uploading, uploadImage, deleteImage } = useStorage()
  const [submitting, setSubmitting] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [isAutosaving, setIsAutosaving] = useState(false)
  const [autosaveError, setAutosaveError] = useState<string | null>(null)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const adFileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    category_id: '',
    subcategory_id: '',
    title: '',
    content: '',
    image_url: '',
    youtube_link: '',
    is_published: false,
    is_pinned: false,
    published_at: '',
    slug: '',
    ad_image_url: '',
    ad_link_url: ''
  })

  const filteredSubcategories = subcategories.filter(
    (sub) => sub.category_id === formData.category_id
  )

  useEffect(() => {
    if (initialData) {
      setFormData({
        category_id: initialData.category_id || '',
        subcategory_id: initialData.subcategory_id || '',
        title: initialData.title || '',
        content: initialData.content || '',
        image_url: initialData.image_url || '',
        youtube_link: initialData.youtube_link || '',
        is_published: initialData.is_published || false,
        is_pinned: initialData.is_pinned || false,
        published_at: initialData.published_at || '',
        slug: initialData.slug || '',
        ad_image_url: initialData.ad_image_url || '',
        ad_link_url: initialData.ad_link_url || ''
      })
    }
  }, [initialData])

  const isFirstMount = useRef(true)
  const lastSavedDataRef = useRef<any>(null)

  useEffect(() => {
    if (initialData && isFirstMount.current) {
      isFirstMount.current = false
      lastSavedDataRef.current = {
        category_id: initialData.category_id || '',
        subcategory_id: initialData.subcategory_id || '',
        title: initialData.title || '',
        content: initialData.content || '',
        image_url: initialData.image_url || '',
        youtube_link: initialData.youtube_link || '',
        is_published: initialData.is_published || false,
        is_pinned: initialData.is_pinned || false,
        published_at: initialData.published_at || '',
        slug: initialData.slug || '',
        ad_image_url: initialData.ad_image_url || '',
        ad_link_url: initialData.ad_link_url || ''
      }
      return
    }

    if (!initialData) return

    const hasChanged = JSON.stringify(formData) !== JSON.stringify(lastSavedDataRef.current)
    if (!hasChanged) return

    const delayDebounce = setTimeout(async () => {
      setIsAutosaving(true)
      setAutosaveError(null)
      try {
        const res = await fetch(`/api/news/${initialData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const json = await res.json()
        if (json.error) {
          setAutosaveError(json.error)
        } else {
          lastSavedDataRef.current = formData
          setLastSavedTime(new Date())
        }
      } catch (err) {
        setAutosaveError('Failed to autosave')
      } finally {
        setIsAutosaving(false)
      }
    }, 1500)

    return () => clearTimeout(delayDebounce)
  }, [formData, initialData])


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (formData.image_url) {
      await deleteImage(formData.image_url)
    }

    const result = await uploadImage(file, 'news')
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

  const handleAdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (formData.ad_image_url) {
      await deleteImage(formData.ad_image_url)
    }

    const result = await uploadImage(file, 'news')
    if (result) {
      setFormData(prev => ({ ...prev, ad_image_url: result }))
    }
  }

  const handleRemoveAdImage = async () => {
    if (formData.ad_image_url) {
      await deleteImage(formData.ad_image_url)
    }
    setFormData(prev => ({ ...prev, ad_image_url: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await onSubmit(formData)
      if (!initialData) {
        localStorage.removeItem('news-draft')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setShowCancelConfirm(true)
  }

  const confirmCancel = () => {
    setShowCancelConfirm(false)
    if (!initialData) {
      localStorage.removeItem('news-draft')
    }
    onCancel()
  }

  const updateField = (field: string, value: any, extraField?: string, extraValue?: any) => {
    setFormData(prev => ({ ...prev, [field]: value, ...(extraField ? { [extraField]: extraValue } : {}) }))
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main editor area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {/* Title */}
              <div className="px-6 pt-6 pb-2">
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  required
                  className="w-full text-3xl font-bold text-gray-900 bg-transparent border-none outline-none placeholder:text-gray-300"
                  placeholder="Untitled"
                />
              </div>

              {/* Content editor */}
              <div className="px-6 pb-6">
                <RichTextEditor
                  content={formData.content || ''}
                  onChange={(content) => updateField('content', content)}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
            {/* Publish card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Publish Settings
              </h3>

              {/* Publish toggle */}
              <button
                type="button"
                onClick={() => updateField('is_published', !formData.is_published, 'published_at', formData.is_published ? '' : new Date().toISOString())}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  formData.is_published
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    formData.is_published ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">Publish</div>
                    <div className="text-xs text-gray-500">{formData.is_published ? 'Live & visible' : 'Saved as draft'}</div>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full transition-all relative ${
                  formData.is_published ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    formData.is_published ? 'left-5' : 'left-0.5'
                  }`} />
                </div>
              </button>

              {/* Pin toggle */}
              <button
                type="button"
                onClick={() => updateField('is_pinned', !formData.is_pinned)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  formData.is_pinned
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    formData.is_pinned ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Pin className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">Pin to Home</div>
                    <div className="text-xs text-gray-500">{formData.is_pinned ? 'Featured on homepage' : 'Show in regular feed'}</div>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full transition-all relative ${
                  formData.is_pinned ? 'bg-indigo-500' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    formData.is_pinned ? 'left-5' : 'left-0.5'
                  }`} />
                </div>
              </button>
            </div>

            {/* URL settings card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" />
                URL Settings
              </h3>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Custom Link Slug (Optional)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      updateField('slug', value)
                    }}
                    className="w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-400"
                    placeholder="e.g. crimekottayam34"
                  />
                </div>
                <span className="text-[10px] text-gray-400 block mt-1">
                  Lowercase letters, numbers, and hyphens only.
                </span>
              </div>
            </div>

            {/* Category card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Organization
              </h3>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
                <div className="relative">
                  <select
                    value={formData.category_id || ''}
                    onChange={(e) => updateField('category_id', e.target.value, 'subcategory_id', '')}
                    className="w-full appearance-none px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-400 cursor-pointer pr-9"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {filteredSubcategories.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Subcategory</label>
                  <div className="relative">
                    <select
                      value={formData.subcategory_id || ''}
                      onChange={(e) => updateField('subcategory_id', e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-400 cursor-pointer pr-9"
                    >
                      <option value="">Select subcategory</option>
                      {filteredSubcategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Media card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImagePlus className="w-3.5 h-3.5" />
                Media
              </h3>

              {/* Image upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                {formData.image_url ? (
                  <div className="relative group rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                        <span className="text-xs font-medium">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="w-7 h-7" />
                        <span className="text-xs font-medium">Click to upload image</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* YouTube link */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">YouTube Link</label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={formData.youtube_link || ''}
                    onChange={(e) => updateField('youtube_link', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-400"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </div>

            {/* In-Article Ad card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                In-Article Ad (Optional)
              </h3>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Ad Image</label>
                <input
                  ref={adFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAdImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                {formData.ad_image_url ? (
                  <div className="relative group rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={formData.ad_image_url}
                      alt="Ad Preview"
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAdImage}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                      title="Remove ad image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => adFileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-24 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                        <span className="text-[11px] font-medium">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="w-6 h-6" />
                        <span className="text-[11px] font-medium">Click to upload ad image</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Ad Redirect Link</label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={formData.ad_link_url || ''}
                    onChange={(e) => updateField('ad_link_url', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-400"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky action bar */}
        <div className="sticky bottom-0 mt-6 -mx-4 px-4 py-3 bg-white/80 backdrop-blur-md border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </button>
            {isAutosaving && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                Autosaving...
              </span>
            )}
            {!isAutosaving && lastSavedTime && !autosaveError && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Saved draft to database ({lastSavedTime.toLocaleTimeString()})
              </span>
            )}
            {!isAutosaving && !lastSavedTime && !autosaveError && initialData && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Draft loaded
              </span>
            )}
            {autosaveError && (
              <span className="text-xs text-red-500 flex items-center gap-1 font-medium">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                Autosave failed: {autosaveError}
              </span>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={uploading || submitting}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              initialData ? 'Save Changes' : 'Publish News'
            )}
          </button>
        </div>
      </form>

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Exit editor?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Any unsaved changes will be lost. The draft article is already stored in the database.
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
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
