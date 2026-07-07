import { profilesRepository } from '@/repositories/profiles.repository'
import { Profile, ApiResponse } from '@/types'

export const profilesService = {
  async getAllProfiles(): Promise<ApiResponse<Profile[]>> {
    try {
      const data = await profilesRepository.findAll()
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch profiles' }
    }
  },

  async getProfilesByRole(role: 'admin' | 'staff' | 'user'): Promise<ApiResponse<Profile[]>> {
    try {
      const data = await profilesRepository.findByRole(role)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch profiles by role' }
    }
  },

  async getProfileById(id: string): Promise<ApiResponse<Profile>> {
    try {
      const result = await profilesRepository.findById(id)
      if (!result) return { data: null, error: 'Profile not found' }
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch profile' }
    }
  },
}
