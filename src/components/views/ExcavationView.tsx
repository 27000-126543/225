import { useState } from 'react'
import { Shovel, Users, Zap, MapPin, Star, Clock } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { RarityBadge } from '../common/RarityBadge'
import { StatCard } from '../common/StatCard'
import { getWeatherText, getToolQualityText } from '../../utils/helpers'
import { Artifact } from '../../types'

export const ExcavationView = () => {
  const { ruinSites, team, player, excavate } = useGameStore()
  const [selectedRuin, setSelectedRuin] = useState<string | null>(null)
  const [isExcavating, setIsExcavating] = useState(false)
  const [lastLoot, setLastLoot] = useState<Artifact | null>(null)
  const [message, setMessage] = useState<string>('')

  const handleExcavate = (ruinId: string) => {
    if (isExcavating) return
    setIsExcavating(true)
    setMessage('')

    setTimeout(() => {
      const result = excavate(ruinId)
      setMessage(result.message)
      if (result.loot) {
        setLastLoot(result.loot)
      }
      setIsExcavating(false)
    }, 2000)
  }

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
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={<Users className="text-blue-400" />} label="考古队" value={team.name} subValue={`${team.members.length}名成员`} color="blue" />
        <StatCard icon={<Star className="text-yellow-400" />} label="工具品质" value={getToolQualityText(team.toolQuality)} subValue="挖掘加成" color="yellow" />
        <StatCard icon={<Zap className="text-green-400" />} label="当前体力" value={`${player.stamina}/${player.maxStamina}`} subValue="每30秒恢复1点" color="green" />
        <StatCard icon={<MapPin className="text-red-400" />} label="总挖掘深度" value={`${player.excavationDepth}m`} subValue="已探索区域" color="red" />
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${lastLoot ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
          <p className="text-white font-medium">{message}</p>
          {lastLoot && (
            <div className="mt-3 flex items-center gap-4 p-3 bg-black/30 rounded-lg">
              <span className="text-4xl">{lastLoot.image}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{lastLoot.name}</span>
                  <RarityBadge rarity={lastLoot.rarity} size="sm" />
                </div>
                <p className="text-sm text-gray-400">{lastLoot.description}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {ruinSites.map(ruin => (
          <div
            key={ruin.id}
            className={`glass-card rounded-2xl p-6 border-2 transition-all cursor-pointer ${
              selectedRuin === ruin.id ? 'border-purple-500' : 'border-transparent hover:border-purple-500/50'
            } ${!ruin.unlocked ? 'opacity-50' : ''}`}
            onClick={() => ruin.unlocked && setSelectedRuin(ruin.id)}
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

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Zap className="w-4 h-4 text-green-400" />
                <span>消耗体力: {ruin.staminaCost}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>深度: {ruin.depth}m</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>最低等级: Lv.{ruin.minLevel}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                {getWeatherText(ruin.weather)}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {ruin.possibleDrops.map(drop => (
                <span key={drop} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                  {drop === 'artifact_fragment' ? '文物碎片' : drop === 'scroll' ? '古代卷轴' : '稀有宝石'}
                </span>
              ))}
            </div>

            {ruin.unlocked ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleExcavate(ruin.id)
                }}
                disabled={isExcavating || player.stamina < ruin.staminaCost}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  isExcavating && selectedRuin === ruin.id
                    ? 'bg-purple-400 cursor-wait animate-pulse'
                    : player.stamina < ruin.staminaCost
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                } text-white`}
              >
                {isExcavating && selectedRuin === ruin.id ? '挖掘中...' : '开始挖掘'}
              </button>
            ) : (
              <div className="w-full py-3 rounded-xl bg-gray-700 text-gray-400 text-center font-bold">
                🔒 等级不足，需要 Lv.{ruin.minLevel}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          当前考古队 - {team.name}
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {team.members.map(member => (
            <div key={member.id} className="bg-purple-500/10 rounded-xl p-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl mb-2">
                {member.role === 'leader' ? '👑' : member.role === 'digger' ? '⛏️' : member.role === 'scout' ? '🔭' : '🔧'}
              </div>
              <p className="text-white font-semibold">{member.name}</p>
              <p className="text-purple-400 text-sm">
                {member.role === 'leader' ? '队长' : member.role === 'digger' ? '挖掘手' : member.role === 'scout' ? '侦察兵' : '修复师'}
              </p>
              <p className="text-gray-400 text-xs mt-1">技能: {member.skill}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
