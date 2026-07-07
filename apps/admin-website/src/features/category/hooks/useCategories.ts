'use client'

import { useState, useEffect, useCallback } from 'react'
import { Category, Subcategory } from '../types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [categoryFormData, setCategoryFormData] = useState({ name: '', slug: '' })
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: '',
    slug: '',
    description: '',
  })

  const fetchCategories = useCallback(async () => {
    const res = await fetch('/api/categories')
    const json = await res.json()
    if (json.data) {
      setCategories(json.data)
    }
    setLoading(false)
  }, [])

  const fetchSubcategories = useCallback(async () => {
    const res = await fetch('/api/subcategories')
    const json = await res.json()
    if (json.data) {
      setSubcategories(json.data)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
    fetchSubcategories()
  }, [fetchCategories, fetchSubcategories])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const submitCategory = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const payload = {
        name: categoryFormData.name,
        slug: generateSlug(categoryFormData.name),
        description: null,
      }

      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (json.error) {
          alert(json.error)
          return
        }
        if (json.data) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? json.data : c)),
          )
        }
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (json.error) {
          alert(json.error)
          return
        }
        if (json.data) {
          setCategories((prev) =>
            [...prev, json.data].sort((a, b) => a.name.localeCompare(b.name)),
          )
        }
      }
      setShowCategoryForm(false)
      setEditingCategory(null)
      setCategoryFormData({ name: '', slug: '' })
    },
    [editingCategory, categoryFormData],
  )

  const submitSubcategory = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selectedCategoryId) return
      const payload = {
        category_id: selectedCategoryId,
        name: subcategoryFormData.name,
        slug: generateSlug(subcategoryFormData.name),
        description: subcategoryFormData.description || null,
      }

      if (editingSubcategory) {
        const res = await fetch(`/api/subcategories/${editingSubcategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: payload.name,
            slug: payload.slug,
            description: payload.description,
          }),
        })
        const json = await res.json()
        if (json.error) {
          alert(json.error)
          return
        }
        if (json.data) {
          setSubcategories((prev) =>
            prev.map((s) => (s.id === editingSubcategory.id ? json.data : s)),
          )
        }
      } else {
        const res = await fetch('/api/subcategories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (json.error) {
          alert(json.error)
          return
        }
        if (json.data) {
          setSubcategories((prev) =>
            [...prev, json.data].sort((a, b) => a.name.localeCompare(b.name)),
          )
        }
      }
      setShowSubcategoryForm(false)
      setEditingSubcategory(null)
      setSelectedCategoryId(null)
      setSubcategoryFormData({ name: '', slug: '', description: '' })
    },
    [editingSubcategory, subcategoryFormData, selectedCategoryId],
  )

  const editCategory = useCallback((category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({ name: category.name, slug: category.slug })
    setShowCategoryForm(true)
  }, [])

  const deleteCategory = useCallback(
    async (id: string) => {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      setSubcategories((prev) => prev.filter((s) => s.category_id !== id))
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.error) {
        alert(json.error)
        fetchCategories()
        fetchSubcategories()
      }
    },
    [],
  )

  const addSubcategory = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setEditingSubcategory(null)
    setSubcategoryFormData({ name: '', slug: '', description: '' })
    setShowSubcategoryForm(true)
  }, [])

  const editSubcategory = useCallback((subcategory: Subcategory) => {
    setSelectedCategoryId(subcategory.category_id)
    setEditingSubcategory(subcategory)
    setSubcategoryFormData({
      name: subcategory.name,
      slug: subcategory.slug,
      description: subcategory.description || '',
    })
    setShowSubcategoryForm(true)
  }, [])

  const deleteSubcategory = useCallback(async (id: string) => {
    setSubcategories((prev) => prev.filter((s) => s.id !== id))
    const res = await fetch(`/api/subcategories/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.error) {
      alert(json.error)
      fetchSubcategories()
    }
  }, [])

  const toggleCategoryExpand = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }, [])

  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setCategoryFormData({ ...categoryFormData, name, slug: generateSlug(name) })
  }

  const handleSubcategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setSubcategoryFormData({ ...subcategoryFormData, name, slug: generateSlug(name) })
  }

  const openAddCategoryForm = () => {
    setShowCategoryForm(true)
    setEditingCategory(null)
    setCategoryFormData({ name: '', slug: '' })
  }

  const cancelCategoryForm = () => {
    setShowCategoryForm(false)
    setEditingCategory(null)
    setCategoryFormData({ name: '', slug: '' })
  }

  const cancelSubcategoryForm = () => {
    setShowSubcategoryForm(false)
    setEditingSubcategory(null)
    setSelectedCategoryId(null)
    setSubcategoryFormData({ name: '', slug: '', description: '' })
  }

  const reorderCategories = async (fromIndex: number, toIndex: number) => {
    const newCategories = [...categories]
    const [movedCategory] = newCategories.splice(fromIndex, 1)
    newCategories.splice(toIndex, 0, movedCategory)

    const updates = newCategories.map((category, index) => ({
      id: category.id,
      priority: index,
    }))

    setCategories(newCategories)

    try {
      const res = await fetch('/api/categories/priorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      const json = await res.json()
      if (json.error) {
        alert(json.error)
        fetchCategories()
      }
    } catch (error) {
      alert('Failed to update category order')
      fetchCategories()
    }
  }

  return {
    categories,
    subcategories,
    loading,
    showCategoryForm,
    showSubcategoryForm,
    editingCategory,
    editingSubcategory,
    selectedCategoryId,
    expandedCategories,
    categoryFormData,
    subcategoryFormData,
    setCategoryFormData,
    setSubcategoryFormData,
    submitCategory,
    submitSubcategory,
    editCategory,
    deleteCategory,
    addSubcategory,
    editSubcategory,
    deleteSubcategory,
    toggleCategoryExpand,
    handleCategoryNameChange,
    handleSubcategoryNameChange,
    openAddCategoryForm,
    cancelCategoryForm,
    cancelSubcategoryForm,
    reorderCategories,
  }
}
