'use client'

import { useThemeStore } from '@/store/themeStore'
import { useCategories } from '../hooks/useCategories'

export function CategoryManager() {
  const { colors } = useThemeStore()
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

  if (loading) {
    return (
      <div className="p-8">Loading categories...</div>
    )
  }

  return (
    <div>
      <div className="flex sm:hidden justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${colors.text}`}>Categories</h1>
        <button
          onClick={openAddCategoryForm}
          className="px-4 py-2 bg-button text-white rounded-lg hover:opacity-90 text-sm"
        >
          + Add
        </button>
      </div>

      <div className="hidden sm:flex justify-between items-center mb-8">
        <h1 className={`text-4xl font-bold ${colors.text}`}>Categories</h1>
        <button
          onClick={openAddCategoryForm}
          className="px-6 py-3 bg-button text-white rounded-lg hover:opacity-90"
        >
          Add Category
        </button>
      </div>

      {showCategoryForm && (
        <div className={`${colors.card} p-4 sm:p-6 rounded-lg shadow mb-6`}>
          <h2 className={`text-xl sm:text-2xl font-semibold mb-4 ${colors.text}`}>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={submitCategory} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Name</label>
              <input
                type="text"
                value={categoryFormData.name}
                onChange={handleCategoryNameChange}
                required
                className={`w-full p-3 ${colors.border} rounded-lg ${colors.text}`}
                placeholder="Category name"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-button text-white rounded-lg hover:opacity-90"
              >
                {editingCategory ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={cancelCategoryForm}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {categories.length === 0 ? (
          <p className={colors.textSecondary}>No categories found</p>
        ) : (
          categories.map((category) => (
            <div key={category.id} className={`${colors.card} p-4 sm:p-6 rounded-lg shadow`}>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg sm:text-xl font-semibold ${colors.text} truncate`}>{category.name}</h3>
                  {category.description && (
                    <p className={`${colors.text} text-sm mt-1`}>{category.description}</p>
                  )}
                </div>
                <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={() => editCategory(category)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-button text-white rounded hover:opacity-90 text-xs sm:text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 text-white rounded hover:bg-red-600 text-xs sm:text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
