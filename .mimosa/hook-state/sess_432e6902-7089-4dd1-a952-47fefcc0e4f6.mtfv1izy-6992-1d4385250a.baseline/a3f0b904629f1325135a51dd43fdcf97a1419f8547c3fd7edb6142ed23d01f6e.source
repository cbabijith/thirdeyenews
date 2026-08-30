import { NextRequest, NextResponse } from 'next/server'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

export const runtime = 'nodejs'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME || ''

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

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
    return NextResponse.json({ success: true, error: null })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
