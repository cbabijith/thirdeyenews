import { adsService, Ad } from '@/features/ads'
import { notFound } from 'next/navigation'
import { EditAdClient } from './EditAdClient'

export const revalidate = 0

interface EditAdPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditAdPage({ params }: EditAdPageProps) {
  const { id } = await params

  const result = await adsService.getAdById(id)

  if (!result.data) {
    return notFound()
  }

  return <EditAdClient ad={result.data as Ad} />
}
