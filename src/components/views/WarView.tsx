import { useState } from 'react'
import { Swords, Shield, Trophy, Clock, Users, Flame } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { formatNumber } from '../../utils/helpers'

const mockWars = [
  {
    id: 'war1',
    ruinName: '龙巢废墟',
    guildA: '远古探秘者公会',
    guildB: '黄金猎人公会',
    status: 'upcoming',
    startTime: Date.now() + 86400000,
    participantsA: 12,
    participantsB: 15,
  },
  {
    id: 'war2',
    ruinName: '遗忘神殿',
    guildA: '远古探秘者公会',
    guildB: '深渊行者公会',
    status: 'active',
    startTime: Date.now() - 3600000,
    participantsA: 8,
    participantsB: 10,
    scoreA: 2450,
    scoreB: 2180,
  },
  {
    id: 'war3',
    ruinName: '精灵森林遗迹',
    guildA: '远古探秘者公会',
    guildB: '月光精灵公会',
    status: 'ended',
    winner: 'A',
    participantsA: 10,
    participantsB: 8,
    scoreA: 3200,
    scoreB: 2850,
  }
]

export const WarView = () => {
  const { guild, player } = useGameStore()
  const [selectedWar, setSelectedWar] = useState<string | null>(null)

  const myMember = guild.members.find(m => m.id === player.id)
  const canJoin = myMember && (myMember.role === 'leader' || myMember.role === 'vice' || myMember.contribution >= 1000)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming': return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">即将开始</span>
      case 'active': return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm animate-pulse">进行中</span>
      case 'ended': return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">已结束</span>
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Swords className="w-7 h-7 text-red-400" />
            遗迹争夺战
          </h2>
          <p className="text-gray-400 mt-1">与其他公会争夺稀有遗迹的所有权</p>
        </div>
        {canJoin && (
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold transition-all flex items-center gap-2">
            <Flame className="w-5 h-5" />
            发起争夺战
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <Trophy className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
          <p className="text-gray-400 text-sm">总胜场</p>
          <p className="text-2xl font-bold text-yellow-400">12</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Shield className="w-8 h-8 mx-auto text-blue-400 mb-2" />
          <p className="text-gray-400 text-sm">参与次数</p>
          <p className="text-2xl font-bold text-blue-400">18</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Users className="w-8 h-8 mx-auto text-purple-400 mb-2" />
          <p className="text-gray-400 text-sm">胜率</p>
          <p className="text-2xl font-bold text-purple-400">66.7%</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Clock className="w-8 h-8 mx-auto text-green-400 mb-2" />
          <p className="text-gray-400 text-sm">公会声望</p>
          <p className="text-2xl font-bold text-green-400">{formatNumber(guild.reputation)}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">战斗列表</h3>
        {mockWars.map(war => (
          <div
            key={war.id}
            onClick={() => setSelectedWar(war.id)}
            className={`glass-card rounded-2xl p-6 cursor-pointer transition-all border-2 ${
              selectedWar === war.id ? 'border-purple-500' : 'border-transparent hover:border-purple-500/50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Swords className="w-6 h-6 text-red-400" />
                <span className="text-white font-bold text-lg">{war.ruinName}</span>
                {getStatusBadge(war.status)}
              </div>
              {war.status === 'upcoming' && (
                <div className="text-gray-400 text-sm">
                  开始时间: {war.startTime ? new Date(war.startTime).toLocaleString() : '待定'}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl mb-2">
                  🏛️
                </div>
                <p className="text-white font-semibold">{war.guildA}</p>
                <p className="text-gray-400 text-sm">{war.participantsA} 人参战</p>
                {war.scoreA !== undefined && (
                  <p className="text-purple-400 font-bold text-xl mt-2">{formatNumber(war.scoreA)}</p>
                )}
              </div>

              <div className="text-center">
                {war.status === 'ended' ? (
                  <div>
                    <Trophy className="w-12 h-12 mx-auto text-yellow-400 mb-2" />
                    <p className="text-yellow-400 font-bold">
                      {war.winner === 'A' ? war.guildA : war.guildB} 获胜！
                    </p>
                  </div>
                ) : war.status === 'active' ? (
                  <div className="text-4xl font-bold text-red-400 animate-pulse">VS</div>
                ) : (
                  <div className="text-4xl font-bold text-gray-500">VS</div>
                )}
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl mb-2">
                  ⚔️
                </div>
                <p className="text-white font-semibold">{war.guildB}</p>
                <p className="text-gray-400 text-sm">{war.participantsB} 人参战</p>
                {war.scoreB !== undefined && (
                  <p className="text-orange-400 font-bold text-xl mt-2">{formatNumber(war.scoreB)}</p>
                )}
              </div>
            </div>

            {war.status === 'upcoming' && canJoin && (
              <div className="mt-4 flex justify-center gap-4">
                <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold transition-all">
                  报名参战
                </button>
              </div>
            )}

            {war.status === 'active' && (
              <div className="mt-4 flex justify-center gap-4">
                <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold transition-all">
                  进入战场
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">争夺战规则</h3>
        <div className="grid grid-cols-2 gap-6">
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              每个遗迹争夺战持续2小时，双方各派出最多20名成员
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              在同一遗迹中同时挖掘，根据物品品质和数量计算得分
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              稀有物品得分更高，传说级物品有额外加分
            </li>
          </ul>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              胜利方获得遗迹所有权和大量声望奖励
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              胜利方全体成员获得稀有文物奖励
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              只有贡献值达到1000的成员才能参战
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
