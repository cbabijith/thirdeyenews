'use server'

import { storageService } from '@/services/storage.service'

export async function uploadImageAction(formData: FormData, folder: string = 'news') {
  try {
    const file = formData.get('file') as File
    if (!file) throw new Error('No file provided')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const result = await storageService.uploadImage(file, filePath)
    if (result.error || !result.data) {
      return { data: null, error: result.error || 'Failed to upload image' }
    }
    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error uploading image to R2:', error)
    return { data: null, error: (error as Error).message }
  }
}

export async function deleteImageAction(url: string) {
  try {
    const result = await storageService.deleteImage(url)
    return { success: result.success, error: result.error }
  } catch (error) {
    console.error('Error deleting image from R2:', error)
    return { success: false, error: (error as Error).message }
  }
}
