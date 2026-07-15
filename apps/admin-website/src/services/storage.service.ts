function compressImageClientSide(file: File, maxWidth = 1200, quality = 0.82): Promise<File> {
  return new Promise((resolve) => {
    // Only compress image files
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate scaling
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const newFile = new File([blob], `${originalName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(newFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => {
        resolve(file); // fallback to original file on error
      };
    };
    reader.onerror = () => {
      resolve(file); // fallback to original file on error
    };
  });
}

export const storageService = {
  async uploadImage(file: File, path: string): Promise<{ data: string | null; error: string | null }> {
    try {
      // Compress the image in the browser first to save serverless bandwidth and prevent timeouts
      const compressedFile = await compressImageClientSide(file);

      const formData = new FormData()
      formData.append('file', compressedFile)
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
