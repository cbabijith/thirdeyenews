'use server'

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

export async function uploadImageAction(formData: FormData, folder: string = 'news') {
  try {
    const file = formData.get('file') as File
    if (!file) throw new Error('No file provided')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
      Body: buffer,
      ContentType: file.type,
    })

    await s3Client.send(command)

    const publicUrl = `${R2_PUBLIC_URL}/${filePath}`
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

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await s3Client.send(command)
    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting image from R2:', error)
    return { success: false, error: (error as Error).message }
  }
}
