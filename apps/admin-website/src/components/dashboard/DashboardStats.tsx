'use client'

import { FileText, Eye, Folder, Inbox } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500">
          {icon}
        </div>
        <span className="text-xs text-gray-500 font-medium">{title}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  )
}

interface DashboardStatsProps {
  publishedCount: number
  draftCount: number
  totalViews: number
  viewsToday: number
  viewsYesterday: number
  viewsThisWeek: number
  viewsThisMonth: number
  totalCategories: number
}

export function DashboardStats({
  publishedCount,
  draftCount,
  totalViews,
  viewsToday,
  viewsYesterday,
  viewsThisWeek,
  viewsThisMonth,
  totalCategories
}: DashboardStatsProps) {
  return (
    <div className="space-y-4">
      {/* General Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Published"
          value={publishedCount}
          icon={<FileText className="w-4 h-4" />}
        />
        <StatCard
          title="Drafts"
          value={draftCount}
          icon={<Inbox className="w-4 h-4" />}
        />
        <StatCard
          title="Categories"
          value={totalCategories}
          icon={<Folder className="w-4 h-4" />}
        />
        <StatCard
          title="Total Views (All Time)"
          value={totalViews}
          icon={<Eye className="w-4 h-4" />}
        />
      </div>

      {/* Historical View Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Views Today"
          value={viewsToday}
          icon={<Eye className="w-4 h-4 text-green-500" />}
        />
        <StatCard
          title="Views Yesterday"
          value={viewsYesterday}
          icon={<Eye className="w-4 h-4 text-orange-500" />}
        />
        <StatCard
          title="Views This Week"
          value={viewsThisWeek}
          icon={<Eye className="w-4 h-4 text-blue-500" />}
        />
        <StatCard
          title="Views This Month"
          value={viewsThisMonth}
          icon={<Eye className="w-4 h-4 text-purple-500" />}
        />
      </div>
    </div>
  )
}
