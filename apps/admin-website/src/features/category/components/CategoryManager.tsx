'use client'

import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { Plus, Pencil, Trash2, Folder, X } from 'lucide-react'

export function CategoryManager() {
  const {
    categories,
    loading,
    showCategoryForm,
    editingCategory,
    categoryFormData,
    submitCategory,
    editCategory,
    deleteCategory,
    handleCategoryNameChange,
    openAddCategoryForm,
    cancelCategoryForm,
  } = useCategories()

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteCategory(deleteTarget.id)
    setDeleteTarget(null)
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-[1200px] mx-auto">
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
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
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} categories</p>
        </div>
        <button
          onClick={openAddCategoryForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {/* Add/Edit Category Form */}
      {showCategoryForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h3>
            <button onClick={cancelCategoryForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={submitCategory} className="flex gap-3">
            <input
              type="text"
              value={categoryFormData.name}
              onChange={handleCategoryNameChange}
              required
              autoFocus
              className="flex-1 px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-400"
              placeholder="Category name..."
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all"
            >
              {editingCategory ? 'Save' : 'Add'}
            </button>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {categories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No categories yet</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
              <div className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                  <Folder className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{category.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">/{category.slug}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => editCategory(category)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: category.id, name: category.name })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete category?</h3>
            <p className="text-sm text-gray-500 mb-6">
              "{deleteTarget.name}" will be permanently deleted. This cannot be undone.
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
