'use server'

import { profilesService } from '@/services/profiles.service'
import { Profile, ApiResponse } from '@/types'

export async function getAllProfilesAction(): Promise<ApiResponse<Profile[]>> {
  return profilesService.getAllProfiles()
}

export async function getProfilesByRoleAction(role: string): Promise<ApiResponse<Profile[]>> {
  return profilesService.getProfilesByRole(role as 'admin' | 'staff' | 'user')
}

export async function getProfileByIdAction(id: string): Promise<ApiResponse<Profile>> {
  return profilesService.getProfileById(id)
}
