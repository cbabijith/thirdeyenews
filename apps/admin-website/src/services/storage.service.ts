export const storageService = {
  async uploadImage(file: File, path: string): Promise<{ data: string | null; error: string | null }> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', path)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()

      if (json.error) {
        return { data: null, error: json.error }
      }
      return { data: json.data, error: null }
    } catch (error) {
      console.error('Error uploading image:', error)
      return { data: null, error: (error as Error).message }
    }
  },

  async deleteImage(url: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const res = await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const json = await res.json()

      if (json.error) {
        return { success: false, error: json.error }
      }
      return { success: true, error: null }
    } catch (error) {
      console.error('Error deleting image:', error)
      return { success: false, error: (error as Error).message }
    }
  },

  async deleteImageByFilename(filename: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const res = await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `https://pub-7a1a77e5d8f3444d931ce51a542a8b7d.r2.dev/news/${filename}` }),
      })
      const json = await res.json()

      if (json.error) {
        return { success: false, error: json.error }
      }
      return { success: true, error: null }
    } catch (error) {
      console.error('Error deleting image:', error)
      return { success: false, error: (error as Error).message }
    }
  },
}
