import { redirect } from 'next/navigation'
import { requireTeamManager } from '@/features/team/server'
import { TeamError } from '@/features/team/policy'
import { TeamClient } from '@/features/team/components/TeamClient'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  try {
    const { actor } = await requireTeamManager()
    return <TeamClient actor={actor} />
  } catch (error) {
    if (error instanceof TeamError && error.status === 401) redirect('/login')
    if (error instanceof TeamError && error.status === 403) redirect('/content/news')
    throw error
  }
}
