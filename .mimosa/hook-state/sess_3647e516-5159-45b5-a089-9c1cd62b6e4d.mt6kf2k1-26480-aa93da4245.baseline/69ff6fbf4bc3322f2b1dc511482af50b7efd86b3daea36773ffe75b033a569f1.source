export async function compressImage(file: File, maxKB: number = 50): Promise<File> {
  if (file.size <= maxKB * 1024 || !file.type.startsWith('image/')) return file

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        const MAX_DIM = 1000
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = (height * MAX_DIM) / width
            width = MAX_DIM
          } else {
            width = (width * MAX_DIM) / height
            height = MAX_DIM
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(file)
        ctx.drawImage(img, 0, 0, width, height)

        const targetBytes = maxKB * 1024
        let quality = 0.75

        const compress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file)

              if (blob.size > targetBytes && quality > 0.1) {
                quality -= 0.15
                compress()
              } else {
                const compressedFile = new File(
                  [blob],
                  file.name.replace(/\.[^/.]+$/, '') + '.jpg',
                  {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  },
                )
                resolve(compressedFile)
              }
            },
            'image/jpeg',
            quality,
          )
        }
        compress()
      }
      img.onerror = () => resolve(file)
      img.src = e.target?.result as string
    }
    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}
