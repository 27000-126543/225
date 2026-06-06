import { useState } from 'react'
import { BarChart3, Medal, Star, MapPin, Wrench } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { formatNumber } from '../../utils/helpers'

export const LeaderboardView = () => {
  const { leaderboards, player } = useGameStore()
  const [activeBoard, setActiveBoard] = useState<string>('museum')

  const boards = [
    { id: 'museum', name: '博物馆评分', icon: Star, color: 'yellow' },
    { id: 'artifacts', name: '文物收藏数', icon: BarChart3, color: 'purple' },
    { id: 'depth', name: '挖掘深度', icon: MapPin, color: 'blue' },
    { id: 'repair', name: '修复成功率', icon: Wrench, color: 'green' },
  ]

  const currentBoard = leaderboards[activeBoard as keyof typeof leaderboards]
  const myRank = currentBoard.find(e => e.playerId === player.id)

  const getUnit = () => {
    switch (activeBoard) {
      case 'museum': return '分'
      case 'artifacts': return '件'
      case 'depth': return 'm'
      case 'repair': return '%'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-purple-400" />
          全服排行榜
        </h2>
        <p className="text-gray-400 mt-1">每周一0点更新排名</p>
      </div>

      <div className="flex gap-3">
        {boards.map(board => {
          const Icon = board.icon
          return (
            <button
              key={board.id}
              onClick={() => setActiveBoard(board.id)}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                activeBoard === board.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-purple-500/10 text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {board.name}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 glass-card rounded-2xl p-6">
          <div className="space-y-3">
            {currentBoard.map((entry, index) => (
              <div
                key={entry.playerId}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  entry.playerId === player.id
                    ? 'bg-purple-500/30 border border-purple-500/50'
                    : 'bg-purple-500/10 hover:bg-purple-500/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                  index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {index < 3 ? <Medal className="w-6 h-6" /> : entry.rank}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-lg">{entry.playerName}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-2xl ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-300' :
                    index === 2 ? 'text-amber-500' :
                    'text-purple-300'
                  }`}>
                    {formatNumber(entry.value)} <span className="text-sm">{getUnit()}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-purple-900/50 to-pink-900/50">
            <h3 className="text-lg font-bold text-white mb-4">我的排名</h3>
            {myRank ? (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white mb-3">
                  #{myRank.rank}
                </div>
                <p className="text-white font-semibold text-lg">{player.name}</p>
                <p className="text-purple-300 text-3xl font-bold mt-2">
                  {formatNumber(myRank.value)} <span className="text-sm">{getUnit()}</span>
                </p>
              </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无排名数据</p>
                </div>
              )}
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">排行榜说明</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">🏆</span>
                <span>博物馆评分: 根据展示藏品总评分排名</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">📦</span>
                <span>文物收藏: 已修复文物总数排名</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">🗺️</span>
                <span>挖掘深度: 累计挖掘总深度排名</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">🔧</span>
                <span>修复成功: 文物修复成功率排名</span>
              </li>
            </ul>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">赛季奖励</h3>
            <p className="text-gray-400 text-sm mb-4">每周排行榜前列玩家将获得特殊奖励</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-yellow-500/10 rounded-lg">
                <span className="text-yellow-400 text-sm">第1名</span>
                <span className="text-white text-sm font-medium">限定头像框 + 5000金币</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-500/10 rounded-lg">
                <span className="text-gray-300 text-sm">第2-3名</span>
                <span className="text-white text-sm font-medium">3000金币</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-amber-500/10 rounded-lg">
                <span className="text-amber-500 text-sm">第4-10名</span>
                <span className="text-white text-sm font-medium">1000金币</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
