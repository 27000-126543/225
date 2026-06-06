import { useState, useEffect } from 'react'
import { Shovel, Users, Zap, MapPin, Star, Clock, Loader2 } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { RarityBadge } from '../common/RarityBadge'
import { StatCard } from '../common/StatCard'
import { getWeatherText, getToolQualityText, formatNumber } from '../../utils/helpers'

export const ExcavationView = () => {
  const {
    ruinSites, user, weather, excavate,
    fetchRuins, fetchWeather, fetchArtifacts, isLoading
  } = useGameStore()
  const [selectedRuin, setSelectedRuin] = useState<string | null>(null)
  const [lastResults, setLastResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    fetchRuins()
    fetchWeather()
    fetchArtifacts()
  }, [fetchRuins, fetchWeather, fetchArtifacts])

  const handleExcavate = async (ruinId: string) => {
    try {
      const result = await excavate(ruinId)
      if (result?.artifacts) {
        setLastResults(result.artifacts)
        setShowResults(true)
        setTimeout(() => setShowResults(false), 5000)
      }
    } catch {}
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shovel className="w-7 h-7 text-purple-400" />
            遗迹探索
          </h2>
          <p className="text-gray-400 mt-1">选择遗迹，带领你的考古队开始冒险！</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-lg">
          <span className="text-gray-400">当前天气:</span>
          <span className="text-white font-semibold">{getWeatherText(weather)}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={<Users className="text-blue-400" />} label="考古队" value={user.teamName} subValue={`队长: ${user.username}`} color="blue" />
        <StatCard icon={<Star className="text-yellow-400" />} label="工具品质" value={getToolQualityText(user.toolQuality)} subValue="挖掘加成" color="yellow" />
        <StatCard icon={<Zap className="text-green-400" />} label="当前体力" value={`${user.stamina}/${user.maxStamina}`} subValue="点击恢复按钮补充" color="green" />
        <StatCard icon={<MapPin className="text-red-400" />} label="总挖掘深度" value={`${formatNumber(user.excavationDepth)}m`} subValue="已探索区域" color="red" />
      </div>

      {showResults && lastResults.length > 0 && (
        <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/50 animate-bounce">
          <p className="text-white font-bold mb-3">🎉 挖掘成功！获得以下物品：</p>
          <div className="grid grid-cols-3 gap-3">
            {lastResults.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                <span className="text-3xl">{item.image}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{item.name}</span>
                    <RarityBadge rarity={item.rarity} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {ruinSites.map(ruin => {
          const unlocked = user.level >= ruin.minLevel
          return (
            <div
              key={ruin.id}
              className={`glass-card rounded-2xl p-6 border-2 transition-all ${
                selectedRuin === ruin.id ? 'border-purple-500' : 'border-transparent hover:border-purple-500/50'
              } ${!unlocked ? 'opacity-60' : ''}`}
              onClick={() => unlocked && setSelectedRuin(ruin.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{ruin.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{ruin.description}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(ruin.difficulty)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span>消耗体力: <strong className="text-green-400">{ruin.staminaCost}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>深度: <strong className="text-blue-400">{ruin.depth}m</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>最低等级: <strong className="text-purple-400">Lv.{ruin.minLevel}</strong></span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">文物碎片</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">古代卷轴</span>
                <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full">稀有宝石</span>
              </div>

              {unlocked ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExcavate(ruin.id)
                  }}
                  disabled={isLoading || user.stamina < ruin.staminaCost}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    isLoading
                      ? 'bg-purple-400 cursor-wait'
                      : user.stamina < ruin.staminaCost
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transform hover:scale-[1.02]'
                  } text-white flex items-center justify-center gap-2`}
                >
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isLoading ? '挖掘中...' : '开始挖掘'}
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl bg-gray-700 text-gray-400 text-center font-bold">
                  🔒 等级不足，需要 Lv.{ruin.minLevel}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          考古队信息
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-purple-500/10 rounded-xl p-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl mb-2">
              👑
            </div>
            <p className="text-white font-semibold">{user.username}</p>
            <p className="text-purple-400 text-sm">队长</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl mb-2">
              ⛏️
            </div>
            <p className="text-white font-semibold">自动挖掘手</p>
            <p className="text-blue-400 text-sm">挖掘手</p>
          </div>
          <div className="bg-green-500/10 rounded-xl p-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-2xl mb-2">
              🔧
            </div>
            <p className="text-white font-semibold">修复助手</p>
            <p className="text-green-400 text-sm">修复师</p>
          </div>
        </div>
      </div>
    </div>
  )
}
