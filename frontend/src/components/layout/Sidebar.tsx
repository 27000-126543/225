import {
  Shovel, Wrench, Building2, Store, Trophy, Users, BarChart3, ScrollText, Swords
} from 'lucide-react'
import { useGameStore } from '../../store/gameStore'

const menuItems = [
  { id: 'excavation', label: '遗迹挖掘', icon: Shovel },
  { id: 'workshop', label: '鉴定修复', icon: Wrench },
  { id: 'museum', label: '地下博物馆', icon: Building2 },
  { id: 'market', label: '交易市场', icon: Store },
  { id: 'competition', label: '考古竞赛', icon: Trophy },
  { id: 'guild', label: '考古公会', icon: Users },
  { id: 'war', label: '遗迹争夺战', icon: Swords },
  { id: 'leaderboard', label: '排行榜', icon: BarChart3 },
  { id: 'report', label: '数据报告', icon: ScrollText },
]

export const Sidebar = () => {
  const { activeView, setActiveView } = useGameStore()

  return (
    <aside className="w-64 glass-card border-r border-purple-500/30 p-4 flex flex-col gap-2">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white px-2">功能菜单</h2>
      </div>
      {menuItems.map(item => {
        const Icon = item.icon
        const isActive = activeView === item.id
        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive
                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-purple-500/20'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        )
      })}
    </aside>
  )
}
