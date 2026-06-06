import { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  subValue?: string
  color?: string
}

export const StatCard = ({ icon, label, value, subValue, color = 'purple' }: StatCardProps) => {
  const colorClasses: Record<string, string> = {
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30'
  }

  return (
    <div className={`glass-card rounded-xl p-4 bg-gradient-to-br ${colorClasses[color]} border`}>
      <div className="flex items-center gap-3">
        <div className={`text-2xl p-2 rounded-lg bg-${color}-500/20`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-xl font-bold text-white">{value}</p>
          {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
        </div>
      </div>
    </div>
  )
}
