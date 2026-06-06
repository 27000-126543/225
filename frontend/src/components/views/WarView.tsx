import { useState, useEffect } from 'react'
import { Swords, Trophy, Clock, Target, Plus, Flag } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'

export const WarView = () => {
  const { wars, guilds, myGuild, fetchWars, fetchGuilds, declareWar, participateWar, isLoading } = useGameStore()
  const [showDeclareModal, setShowDeclareModal] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState('')
  const [selectedRuin, setSelectedRuin] = useState('遗忘神殿')

  useEffect(() => {
    fetchWars()
    fetchGuilds()
  }, [fetchWars, fetchGuilds])

  const handleDeclare = async () => {
    if (!selectedTarget) return
    await declareWar(selectedTarget, selectedRuin)
    setShowDeclareModal(false)
    setSelectedTarget('')
  }

  const getStatusBadge = (status: string) => {
    if (status === 'ongoing') return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">进行中</span>
    if (status === 'upcoming') return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">即将开始</span>
    return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">已结束</span>
  }

  const canDeclare = myGuild && myGuild.myRole !== 'member'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Swords className="w-7 h-7 text-red-400" />
            遗迹争夺战
          </h2>
          <p className="text-gray-400 mt-1">与其他公会争夺遗迹的所有权和稀有奖励</p>
        </div>
        {canDeclare && (
          <button
            onClick={() => setShowDeclareModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            发起争夺战
          </button>
        )}
      </div>

      {wars.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Swords className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">暂无争夺战</p>
          {canDeclare && <p className="text-gray-500 mt-2">点击上方按钮发起第一场争夺战！</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {wars.map(war => (
            <div key={war.id} className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  <span className="text-white font-bold">{war.ruinName}</span>
                </div>
                {getStatusBadge(war.status)}
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="text-center flex-1">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl mb-2">
                    <Flag className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white font-bold">{war.guildAName}</p>
                  <p className="text-2xl font-bold text-amber-400 mt-2">{war.scoreA}</p>
                </div>

                <div className="px-6">
                  <span className="text-3xl font-bold text-gray-500">VS</span>
                </div>

                <div className="text-center flex-1">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-2xl mb-2">
                    <Flag className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white font-bold">{war.guildBName}</p>
                  <p className="text-2xl font-bold text-amber-400 mt-2">{war.scoreB}</p>
                </div>
              </div>

              {war.status === 'upcoming' && (
                <div className="text-center text-gray-400 text-sm mb-4">
                  <Clock className="w-4 h-4 inline mr-1" />
                  开始时间: {war.startTime ? new Date(war.startTime).toLocaleString() : '待定'}
                </div>
              )}

              {war.status === 'ended' ? (
                <div className="text-center">
                  <Trophy className="w-12 h-12 mx-auto text-yellow-400 mb-2" />
                  <p className="text-yellow-400 font-bold">
                    {war.winnerId === war.guildAId ? war.guildAName : war.guildBName} 获胜！
                  </p>
                </div>
              ) : (
                myGuild && (myGuild.id === war.guildAId || myGuild.id === war.guildBId) && (
                  <button
                    onClick={() => participateWar(war.id)}
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all"
                  >
                    参战
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}

      {showDeclareModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">发起争夺战</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">选择对手公会</label>
                <select
                  value={selectedTarget}
                  onChange={e => setSelectedTarget(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/70 border border-slate-700 rounded-lg text-white outline-none"
                >
                  <option value="">选择公会</option>
                  {guilds.filter(g => g.id !== myGuild?.id).map(g => (
                    <option key={g.id} value={g.id}>{g.name} (Lv.{g.level})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">选择争夺遗迹</label>
                <select
                  value={selectedRuin}
                  onChange={e => setSelectedRuin(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/70 border border-slate-700 rounded-lg text-white outline-none"
                >
                  <option>遗忘神殿</option>
                  <option>龙巢废墟</option>
                  <option>精灵森林遗迹</option>
                  <option>冰封王座</option>
                  <option>深渊地牢</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeclareModal(false)}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500"
                >
                  取消
                </button>
                <button
                  onClick={handleDeclare}
                  disabled={!selectedTarget || isLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 text-white font-medium"
                >
                  宣战
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
