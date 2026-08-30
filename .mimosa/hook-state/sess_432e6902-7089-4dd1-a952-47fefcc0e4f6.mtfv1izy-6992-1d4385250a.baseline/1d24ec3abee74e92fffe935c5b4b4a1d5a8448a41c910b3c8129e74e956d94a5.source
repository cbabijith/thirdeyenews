import { Dashboard } from '@/components/dashboard/Dashboard'
import { dashboardService } from '@/services/dashboard.service'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const initialStats = await dashboardService.getStats('all')
  return <Dashboard initialStats={initialStats} />
}
