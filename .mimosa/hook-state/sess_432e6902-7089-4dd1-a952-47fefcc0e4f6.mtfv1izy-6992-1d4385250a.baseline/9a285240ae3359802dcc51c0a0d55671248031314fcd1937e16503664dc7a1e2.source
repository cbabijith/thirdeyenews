'use client'

import { useState, useCallback } from 'react'
import { storageService } from '@/services/storage.service'

export function useStorage() {
  const [uploading, setUploading] = useState(false)

  const uploadImage = useCallback(async (file: File, folder: string = 'news'): Promise<string | null> => {
    setUploading(true)
    try {
      const result = await storageService.uploadImage(file, folder)
      if (result.error || !result.data) {
        console.error('Upload error:', result.error)
        return null
      }
      return result.data
    } catch (error) {
      console.error('Upload error:', error)
      return null
    } finally {
      setUploading(false)
    }
  }, [])

  const deleteImage = useCallback(async (url: string): Promise<boolean> => {
    try {
      const result = await storageService.deleteImage(url)
      return result.success
    } catch (error) {
      console.error('Delete error:', error)
      return false
    }
  }, [])

  return { uploading, uploadImage, deleteImage }
}
