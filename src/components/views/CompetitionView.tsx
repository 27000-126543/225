import { useState } from 'react'
import { Trophy, Medal, Clock, Gift, Star, Award } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { RarityBadge } from '../common/RarityBadge'
import { formatNumber } from '../../utils/helpers'

export const CompetitionView = () => {
  const { competition, artifacts, joinCompetition, player } = useGameStore()
  const [selectedArtifacts, setSelectedArtifacts] = useState<string[]>([])

  const repairedArtifacts = artifacts.filter(a => a.isRepaired && a.isIdentified)
  const myEntry = competition.participants.find(p => p.playerId === player.id)

  const toggleArtifact = (artifactId: string) => {
    setSelectedArtifacts(prev =>
      prev.includes(artifactId)
        ? prev.filter(id => id !== artifactId)
        : prev.length < 3 ? [...prev, artifactId] : prev
    )
  }

  const handleJoin = () => {
    if (selectedArtifacts.length === 0) return
    joinCompetition(selectedArtifacts)
    setSelectedArtifacts([])
  }

  const daysLeft = Math.ceil((competition.endDate - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-400" />
            考古竞赛
          </h2>
          <p className="text-gray-400 mt-1">提交藏品参赛，赢取限定工具奖励！</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-lg">
          <Clock className="w-5 h-5 text-purple-400" />
          <span className="text-purple-300">第 {competition.season} 赛季 · 剩余 {daysLeft} 天</span>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-yellow-400">{competition.name}</h3>
            <p className="text-gray-300 mt-1">提交最多3件修复完成的藏品参赛</p>
          </div>
          <Trophy className="w-16 h-16 text-yellow-400 animate-float" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Medal className="w-5 h-5 text-yellow-400" />
              当前排名
            </h3>
            <div className="space-y-3">
              {competition.participants.slice(0, 10).map((entry, index) => (
                <div
                  key={entry.playerId}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                    entry.playerId === player.id
                      ? 'bg-purple-500/30 border border-purple-500/50'
                      : 'bg-purple-500/10'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {index < 3 ? <Medal className="w-5 h-5" /> : entry.rank}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{entry.playerName}</p>
                    <p className="text-gray-400 text-sm">提交 {entry.artifactIds.length} 件藏品</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold text-xl">{formatNumber(entry.score)}</p>
                    <p className="text-gray-500 text-xs">综合评分</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-400" />
              我的藏品 (选择最多3件)
            </h3>
            {myEntry && (
              <div className="mb-4 p-3 bg-green-500/20 rounded-lg flex items-center justify-between">
                <span className="text-green-300">✓ 已参赛，当前排名第 {myEntry.rank} 名，得分 {formatNumber(myEntry.score)}</span>
              </div>
            )}
            <div className="grid grid-cols-4 gap-3">
              {repairedArtifacts.map(artifact => (
                <div
                  key={artifact.id}
                  onClick={() => toggleArtifact(artifact.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all text-center ${
                    selectedArtifacts.includes(artifact.id)
                      ? 'bg-purple-500/30 border-2 border-purple-500'
                      : 'bg-purple-500/10 border-2 border-transparent hover:border-purple-500/50'
                  }`}
                >
                  <span className="text-3xl">{artifact.image}</span>
                  <p className="text-white text-sm font-medium mt-2 truncate">{artifact.name}</p>
                  <RarityBadge rarity={artifact.rarity} size="sm" />
                  <p className="text-yellow-400 text-xs mt-1 font-bold">{artifact.score}分</p>
                </div>
              ))}
            </div>
            {selectedArtifacts.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-purple-300">
                  已选择 {selectedArtifacts.length} 件，预计得分: {formatNumber(
                    selectedArtifacts.reduce((sum, id) => {
                      const art = artifacts.find(a => a.id === id)
                      return sum + (art?.score || 0)
                    }, 0)
                  )}
                </p>
                <button
                  onClick={handleJoin}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold transition-all"
                >
                  提交参赛
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-400" />
              赛季奖励
            </h3>
            <div className="space-y-3">
              {competition.rewards.map(reward => (
                <div key={reward.rank} className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    reward.rank === 1 ? 'bg-yellow-500 text-black' :
                    reward.rank === 2 ? 'bg-gray-400 text-black' :
                    'bg-amber-700 text-white'
                  }`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">第 {reward.rank} 名</p>
                    <p className="text-purple-300 text-sm">{reward.tool}</p>
                  </div>
                  <p className="text-yellow-400 font-bold">{formatNumber(reward.gold)}💰</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">参赛规则</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                每人最多提交3件已修复的藏品
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                评分按藏品稀有度、年代、完整度综合计算
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                稀有词缀会提供额外加分
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                赛季结束后统一发放奖励
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                限定工具仅通过竞赛获得
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
