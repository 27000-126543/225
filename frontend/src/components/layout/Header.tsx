import { Coins, Gem, Zap, User, Bell, LogOut } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { formatNumber } from '../../utils/helpers'
import { ProgressBar } from '../common/ProgressBar'
import { useState, useEffect } from 'react'

export const Header = () => {
  const { user, announcements, fetchAnnouncements, logout, recoverStamina } = useGameStore()
  const [showAnnouncements, setShowAnnouncements] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
    const interval = setInterval(fetchAnnouncements, 30000)
    return () => clearInterval(interval)
  }, [fetchAnnouncements])

  if (!user) return null

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
              <span className="text-yellow-400 font-semibold">{formatNumber(user.gold)}</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-500/20 px-3 py-1.5 rounded-lg">
              <Gem className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-semibold">{formatNumber(user.gems)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-400 flex-shrink-0" />
              <div className="w-28">
                <ProgressBar value={user.stamina} max={user.maxStamina} color="green" showText={false} height="h-3" />
              </div>
              <span className="text-green-400 text-sm font-semibold">{user.stamina}/{user.maxStamina}</span>
              <button
                onClick={recoverStamina}
                className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 px-2 py-1 rounded transition-colors"
              >
                恢复
              </button>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowAnnouncements(!showAnnouncements); setShowMenu(false) }}
              className="relative p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
            >
              <Bell className="w-5 h-5 text-purple-400" />
              {announcements.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  {Math.min(announcements.length, 9)}
                </span>
              )}
            </button>

            {showAnnouncements && (
              <div className="absolute right-0 top-12 w-80 glass-card rounded-xl border border-purple-500/30 z-50 shadow-2xl">
                <div className="p-3 border-b border-purple-500/20">
                  <h3 className="font-bold text-white">全服公告</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {announcements.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">暂无公告</div>
                  ) : (
                    announcements.map(ann => (
                      <div key={ann.id} className="p-3 border-b border-purple-500/10 hover:bg-purple-500/10">
                        <p className="text-sm text-gray-300">{ann.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(ann.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowMenu(!showMenu); setShowAnnouncements(false) }}
              className="flex items-center gap-3 bg-purple-500/20 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">{user.username}</p>
                <p className="text-xs text-gray-400">Lv.{user.level}</p>
              </div>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-14 w-48 glass-card rounded-xl border border-purple-500/30 z-50 shadow-2xl overflow-hidden">
                <div className="p-2">
                  <div className="px-3 py-2 text-sm text-gray-400 border-b border-purple-500/10">
                    <p>修复熟练度: {user.restorerProficiency.toFixed(1)}%</p>
                    <p>博物馆评分: {user.museumScore}</p>
                  </div>
                  <button
                    onClick={() => { logout(); setShowMenu(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
