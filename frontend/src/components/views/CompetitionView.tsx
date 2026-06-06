import { useState, useEffect } from 'react'
import { Trophy, Medal, Clock, Gift, Award } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { RarityBadge } from '../common/RarityBadge'
import { formatNumber } from '../../utils/helpers'

export const CompetitionView = () => {
  const { artifacts, fetchArtifacts } = useGameStore()
  const [competition, setCompetition] = useState<any>(null)
  const [rankings, setRankings] = useState<any[]>([])
  const [myEntry, setMyEntry] = useState<any>(null)
  const [rewards, setRewards] = useState<any[]>([])
  const [selectedArtifacts, setSelectedArtifacts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchArtifacts()
    loadCompetition()
    loadRewards()
  }, [fetchArtifacts])

  const loadCompetition = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/competition/active', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.competition) {
        setCompetition(data.competition)
        setRankings(data.rankings || [])
        setMyEntry(data.myEntry)
      }
    } catch {}
  }

  const loadRewards = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/competition/rewards', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRewards(await res.json())
    } catch {}
  }

  const handleJoin = async () => {
    if (!competition || selectedArtifacts.length === 0) return
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/competition/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ competitionId: competition.id, artifactIds: selectedArtifacts })
      })
      await loadCompetition()
      setSelectedArtifacts([])
    } finally {
      setLoading(false)
    }
  }

  const toggleArtifact = (id: string) => {
    setSelectedArtifacts(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const repairedArtifacts = artifacts.filter(a => a.isRepaired)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-7 h-7 text-amber-400" />
          考古竞赛
        </h2>
        <p className="text-gray-400 mt-1">提交藏品参赛，赢取限定奖励！</p>
      </div>

      {competition && (
        <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-purple-900/30 to-amber-900/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" />
                {competition.name}
              </h3>
              <p className="text-gray-400 mt-1">第 {competition.season} 赛季</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">参赛人数</p>
              <p className="text-2xl font-bold text-amber-400">{rankings.length}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">实时排名</h3>
            <div className="space-y-2">
              {rankings.slice(0, 10).map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-xl flex items-center justify-between ${
                    entry.rank === 1 ? 'bg-yellow-500/10 border border-yellow-500/30' :
                    entry.rank === 2 ? 'bg-gray-400/10 border border-gray-400/30' :
                    entry.rank === 3 ? 'bg-amber-600/10 border border-amber-600/30' :
                    'bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl font-bold w-8 text-center ${
                      entry.rank === 1 ? 'text-yellow-400' :
                      entry.rank === 2 ? 'text-gray-400' :
                      entry.rank === 3 ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {entry.rank === 1 ? '🏆' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                    </span>
                    <div>
                      <p className="text-white font-semibold">{entry.playerName}</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-amber-400">{formatNumber(entry.score)}</p>
                </div>
              ))}
            </div>
          </div>

          {!myEntry && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                提交藏品参赛 (已选 {selectedArtifacts.length}/3)
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-4 max-h-80 overflow-y-auto">
                {repairedArtifacts.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">暂无已修复的文物</div>
                ) : (
                  repairedArtifacts.map(art => (
                    <div
                      key={art.id}
                      onClick={() => toggleArtifact(art.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedArtifacts.includes(art.id)
                          ? 'bg-purple-500/30 border-2 border-purple-500'
                          : 'bg-slate-800/50 border-2 border-transparent hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="text-center">
                        <span className="text-3xl">{art.image}</span>
                        <p className="text-white text-sm mt-2 truncate">{art.name}</p>
                        <RarityBadge rarity={art.rarity} size="sm" />
                        <p className="text-xs text-amber-400 mt-1">评分: {art.score}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={handleJoin}
                disabled={selectedArtifacts.length === 0 || loading}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all"
              >
                {loading ? '提交中...' : '提交参赛'}
              </button>
            </div>
          )}

          {myEntry && (
            <div className="glass-card rounded-2xl p-6 bg-green-500/10 border border-green-500/30">
              <h3 className="text-lg font-bold text-green-400 mb-2">✓ 您已参赛</h3>
              <p className="text-white">当前排名: <strong className="text-amber-400">第 {myEntry.rank} 名</strong></p>
              <p className="text-white">当前得分: <strong className="text-amber-400">{formatNumber(myEntry.score)}</strong></p>
            </div>
          )}
        </div>

        <div className="col-span-4">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" />
              奖励列表
            </h3>
            <div className="space-y-3">
              {rewards.map((reward, idx) => (
                <div key={idx} className="p-3 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">第 {reward.rank} 名</span>
                    <RarityBadge rarity={reward.rarity} size="sm" />
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{reward.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
