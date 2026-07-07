import { uploadImage as r2Upload, deleteImage as r2Delete } from '@thirdeyenews/shared-supabase'

export const storageService = {
  async uploadImage(file: File, path: string): Promise<{ data: string | null; error: string | null }> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = path ? `${path}/${fileName}` : `news/${fileName}`

      const publicUrl = await r2Upload(file, filePath)
      return { data: publicUrl, error: null }
    } catch (error) {
      console.error('Error uploading image to R2:', error)
      return { data: null, error: (error as Error).message }
    }
  },

  async deleteImage(url: string): Promise<{ success: boolean; error: string | null }> {
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
  },

  async deleteImageByFilename(filename: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await r2Delete(`news/${filename}`)
      return { success: true, error: null }
    } catch (error) {
      console.error('Error deleting image from R2:', error)
      return { success: false, error: (error as Error).message }
    }
  },
}
