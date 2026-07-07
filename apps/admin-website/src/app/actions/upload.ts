'use server'

import { uploadImage as r2Upload, deleteImage as r2Delete } from '@thirdeyenews/shared-supabase'

export async function uploadImageAction(formData: FormData, folder: string = 'news') {
  try {
    const file = formData.get('file') as File
    if (!file) throw new Error('No file provided')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const publicUrl = await r2Upload(file, filePath)
    return { data: publicUrl, error: null }
  } catch (error) {
    console.error('Error uploading image to R2:', error)
    return { data: null, error: (error as Error).message }
  }
}

export async function deleteImageAction(url: string) {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const newsIdx = pathParts.indexOf('news')
    let key = pathParts[pathParts.length - 1]
    if (newsIdx !== -1) {
      key = pathParts.slice(newsIdx).join('/')
    }

    await r2Delete(key)
    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting image from R2:', error)
    return { success: false, error: (error as Error).message }
  }
}
