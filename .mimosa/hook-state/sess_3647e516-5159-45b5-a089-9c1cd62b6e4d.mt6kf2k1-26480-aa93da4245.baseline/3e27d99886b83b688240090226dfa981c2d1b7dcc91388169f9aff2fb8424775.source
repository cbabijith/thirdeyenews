import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

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

export async function uploadImage(file: File, path: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: path,
    Body: buffer,
    ContentType: file.type,
  })

  await s3Client.send(command)

  // Return the public URL
  return `${R2_PUBLIC_URL}/${path}`
}

export async function deleteImage(path: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: path,
  })

  await s3Client.send(command)
}

export async function getImageUrl(path: string): Promise<string> {
  return `${R2_PUBLIC_URL}/${path}`
}
