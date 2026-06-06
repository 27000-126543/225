import { useState, useEffect } from 'react'
import { BarChart3, Trophy, Medal, Crown, TrendingUp } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { formatNumber } from '../../utils/helpers'

export const LeaderboardView = () => {
  const { leaderboard, fetchLeaderboard, user } = useGameStore()
  const [activeTab, setActiveTab] = useState<'museum' | 'artifacts' | 'excavation' | 'repair'>('museum')

  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [fetchLeaderboard])

  const tabs = [
    { id: 'museum' as const, name: '博物馆评分', icon: Trophy },
    { id: 'artifacts' as const, name: '文物收藏', icon: Crown },
    { id: 'excavation' as const, name: '挖掘深度', icon: TrendingUp },
    { id: 'repair' as const, name: '修复成功率', icon: Medal },
  ]

  const currentData = leaderboard[activeTab] || []

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />
    return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</span>
  }

  const formatValue = (val: number) => {
    if (activeTab === 'repair') return `${val.toFixed(1)}%`
    if (activeTab === 'excavation') return `${formatNumber(val)}m`
    return formatNumber(val)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-amber-400" />
          全服排行榜
        </h2>
        <p className="text-gray-400 mt-1">每周更新，看看谁是最强考古学家！</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-xl transition-all flex flex-col items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : 'bg-slate-800/50 text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{tab.name}</span>
            </button>
          )
        })}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          {tabs.find(t => t.id === activeTab)?.name}排行榜
        </h3>

        {currentData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无排行数据</p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentData.slice(0, 20).map((entry: any) => {
              const isMe = user?.id === entry.id
              return (
                <div
                  key={entry.id}
                  className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                    isMe
                      ? 'bg-purple-500/20 border border-purple-500/50'
                      : 'bg-slate-800/50 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {getRankIcon(entry.rank)}
                    <div>
                      <p className={`font-semibold ${isMe ? 'text-purple-300' : 'text-white'}`}>
                        {entry.username}
                        {isMe && <span className="ml-2 text-xs text-purple-400">(我)</span>}
                      </p>
                      <p className="text-sm text-gray-500">Lv.{entry.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-amber-400">{formatValue(entry.score)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
