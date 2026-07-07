export type AdPosition = 'main_banner' | 'bottom_nav'

export interface Ad {
  id: string
  title: string
  image_url: string
  link_url: string | null
  position: AdPosition
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}
