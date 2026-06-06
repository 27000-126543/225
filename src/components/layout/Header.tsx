import { Coins, Gem, Zap, User, Bell } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { formatNumber } from '../../utils/helpers'
import { ProgressBar } from '../common/ProgressBar'
import { useState } from 'react'

export const Header = () => {
  const { player, announcements } = useGameStore()
  const [showAnnouncements, setShowAnnouncements] = useState(false)

  return (
    <header className="glass-card border-b border-purple-500/30 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏛️</span>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                魔法遗迹考古博物馆
              </h1>
              <p className="text-xs text-gray-400">Magic Ruins Archaeology Museum</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-lg">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">{formatNumber(player.gold)}</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-500/20 px-3 py-1.5 rounded-lg">
              <Gem className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-semibold">{formatNumber(player.gems)}</span>
            </div>
            <div className="flex items-center gap-2 w-40">
              <Zap className="w-4 h-4 text-green-400 flex-shrink-0" />
              <ProgressBar value={player.stamina} max={player.maxStamina} color="green" showText={false} height="h-3" />
              <span className="text-green-400 text-sm font-semibold ml-1">{player.stamina}</span>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowAnnouncements(!showAnnouncements)}
              className="relative p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
            >
              <Bell className="w-5 h-5 text-purple-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                {announcements.length}
              </span>
            </button>

            {showAnnouncements && (
              <div className="absolute right-0 top-12 w-80 glass-card rounded-xl border border-purple-500/30 z-50 shadow-2xl">
                <div className="p-3 border-b border-purple-500/20">
                  <h3 className="font-bold text-white">全服公告</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {announcements.map(ann => (
                    <div key={ann.id} className="p-3 border-b border-purple-500/10 hover:bg-purple-500/10">
                      <p className="text-sm text-gray-300">{ann.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(ann.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 bg-purple-500/20 px-4 py-2 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{player.name}</p>
              <p className="text-xs text-gray-400">Lv.{player.level}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
