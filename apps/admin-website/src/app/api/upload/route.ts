import { NextRequest, NextResponse } from 'next/server'
import { uploadImage as r2Upload } from '@thirdeyenews/shared-supabase'
import sharp from 'sharp'

const MAX_SIZE = 100 * 1024
const TARGET_SIZE = 50 * 1024

async function compressToWebP(buffer: Buffer): Promise<Buffer> {
  let quality = 85
  let width = 1600
  let result = await sharp(buffer)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer()

  while (result.length > TARGET_SIZE && quality > 20) {
    quality -= 10
    result = await sharp(buffer)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer()
  }

  if (result.length > MAX_SIZE && width > 800) {
    width = 800
    quality = 60
    result = await sharp(buffer)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer()

    while (result.length > TARGET_SIZE && quality > 20) {
      quality -= 10
      result = await sharp(buffer)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality })
        .toBuffer()
    }
  }

  return result
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'news'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const originalBuffer = Buffer.from(arrayBuffer)

    const compressedBuffer = await compressToWebP(originalBuffer)

    const fileName = `${Math.random()}.webp`
    const filePath = `${folder}/${fileName}`

    const webpFile = new File([new Uint8Array(compressedBuffer)], fileName, { type: 'image/webp' })

    const publicUrl = await r2Upload(webpFile, filePath)
    return NextResponse.json({ data: publicUrl, error: null })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
