import { adsRepository } from '../repositories/ads.repository'
import { Ad, AdPosition } from '../types'
import { ApiResponse } from '@/types'

export const adsService = {
  async getAllAds(): Promise<ApiResponse<Ad[]>> {
    try {
      const data = await adsRepository.findAll()
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch ads' }
    }
  },

  async getAdById(id: string): Promise<ApiResponse<Ad>> {
    try {
      const result = await adsRepository.findById(id)
      if (!result) return { data: null, error: 'Ad not found' }
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch ad' }
    }
  },

  async getActiveAdsByPosition(position: AdPosition): Promise<ApiResponse<Ad[]>> {
    try {
      const data = await adsRepository.findActiveByPosition(position)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch ads by position' }
    }
  },

  async createAd(data: {
    title: string
    image_url?: string | null
    link_url?: string | null
    youtube_link?: string | null
    position: AdPosition
    display_order: number
    is_active?: boolean
  }): Promise<ApiResponse<Ad>> {
    try {
      const result = await adsRepository.create(data)
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create ad' }
    }
  },

  async updateAd(id: string, updates: Partial<Ad>): Promise<ApiResponse<Ad>> {
    try {
      const result = await adsRepository.update(id, updates)
      if (!result) return { data: null, error: 'Ad not found' }
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update ad' }
    }
  },

  async deleteAd(id: string): Promise<ApiResponse<void>> {
    try {
      await adsRepository.delete(id)
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to delete ad' }
    }
  },

  async toggleAdActive(id: string): Promise<ApiResponse<Ad>> {
    try {
      const result = await adsRepository.toggleActive(id)
      if (!result) return { data: null, error: 'Ad not found' }
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to toggle ad status' }
    }
  },
}
