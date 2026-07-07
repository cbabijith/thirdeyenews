'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAds } from '../hooks/useAds'
import { Plus, Pencil, Trash2, Power, PowerOff, Image as ImageIcon, ExternalLink, X } from 'lucide-react'

export function AdsClient() {
  const {
    ads,
    loading,
    setDeleteItemId,
    toggleActive,
    deleteAd,
  } = useAds()

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteItemId(deleteTarget.id)
    setDeleteTarget(null)
    await deleteAd(deleteTarget.id)
    setDeleteItemId(null)
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-7 bg-gray-100 rounded w-32 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-48 mt-2 animate-pulse" />
          </div>
          <div className="h-10 w-28 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-32 h-32 bg-gray-100 rounded-lg" />
                <div className="flex-1 space-y-2 pt-2">
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ads</h1>
          <p className="text-sm text-gray-500 mt-0.5">{ads.length} ads · {ads.filter(a => a.is_active).length} active</p>
        </div>
        <Link
          href="/content/ads/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Ad
        </Link>
      </div>

      {/* Info banner */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-xs text-gray-500">
        <strong className="text-gray-700">Main Banner</strong> — home & news pages (2-3 recommended). <strong className="text-gray-700">Bottom Nav</strong> — mobile bottom bar (1 active only).
      </div>

      {/* List */}
      <div className="space-y-2">
        {ads.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No ads yet</p>
          </div>
        ) : (
          ads.map((ad) => (
            <div key={ad.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all overflow-hidden">
              <div className="flex gap-4 p-3">
                {/* Thumbnail */}
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
                        ad.is_active ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {ad.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-600">
                        {ad.position === 'main_banner' ? 'Main Banner' : 'Bottom Nav'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Order: {ad.display_order}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 truncate" title={ad.title}>
                      {ad.title}
                    </h3>
                    {ad.link_url && (
                      <a
                        href={ad.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline truncate block mt-1 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{ad.link_url}</span>
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => toggleActive(ad)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                        ad.is_active
                          ? 'text-yellow-600 hover:bg-yellow-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={ad.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {ad.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    </button>
                    <Link
                      href={`/content/ads/edit/${ad.id}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget({ id: ad.id, title: ad.title })}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete ad?</h3>
              <button onClick={() => setDeleteTarget(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              "{deleteTarget.title}" and its image will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
