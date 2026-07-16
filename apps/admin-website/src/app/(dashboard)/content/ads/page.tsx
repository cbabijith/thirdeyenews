import { AdsClient } from '@/features/ads/components/AdsClient'
import { adsService } from '@/features/ads/services/ads.service'

export const dynamic = 'force-dynamic'

export default async function AdsPage() {
  const response = await adsService.getAllAds()
  return <AdsClient initialAds={response.data || []} />
}
