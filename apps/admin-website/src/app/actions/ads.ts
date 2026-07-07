'use server'

import { adsService } from '@/services/ads.service'
import { Ad, AdPosition, ApiResponse } from '@/types'

export async function getAllAdsAction(): Promise<ApiResponse<Ad[]>> {
  return adsService.getAllAds()
}

export async function getAdByIdAction(id: string): Promise<ApiResponse<Ad>> {
  return adsService.getAdById(id)
}

export async function getActiveAdsByPositionAction(position: AdPosition): Promise<ApiResponse<Ad[]>> {
  return adsService.getActiveAdsByPosition(position)
}

export async function createAdAction(data: { title: string; image_url: string; link_url?: string | null; position: AdPosition; display_order: number; is_active?: boolean }): Promise<ApiResponse<Ad>> {
  return adsService.createAd(data)
}

export async function updateAdAction(id: string, updates: Partial<Ad>): Promise<ApiResponse<Ad>> {
  return adsService.updateAd(id, updates)
}

export async function deleteAdAction(id: string): Promise<ApiResponse<void>> {
  return adsService.deleteAd(id)
}

export async function toggleAdActiveAction(id: string): Promise<ApiResponse<Ad>> {
  return adsService.toggleAdActive(id)
}
