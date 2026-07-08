import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_SIZE = 100 * 1024
const TARGET_SIZE = 50 * 1024

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME || ''
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ''

async function compressToWebP(buffer: Buffer): Promise<Buffer> {
  const sharp = (await import('sharp')).default
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

    let uploadBuffer: Buffer
    let contentType: string
    let fileExt: string

    try {
      uploadBuffer = await compressToWebP(originalBuffer)
      contentType = 'image/webp'
      fileExt = 'webp'
    } catch (compressErr) {
      console.error('Sharp compression failed, uploading original:', compressErr)
      uploadBuffer = originalBuffer
      contentType = file.type || 'image/jpeg'
      fileExt = file.name.split('.').pop() || 'jpg'
    }

    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
      Body: uploadBuffer,
      ContentType: contentType,
    })

    await s3Client.send(command)

    const publicUrl = `${R2_PUBLIC_URL}/${filePath}`
    return NextResponse.json({ data: publicUrl, error: null })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
