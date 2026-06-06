import { useState, useEffect } from 'react'
import { Users, Plus, Crown, ArrowUp, LogOut, Gift } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { formatNumber } from '../../utils/helpers'

export const GuildView = () => {
  const {
    guilds, myGuild, user, materials,
    fetchGuilds, fetchMaterials, createGuild, joinGuild, leaveGuild,
    contributeToGuild, upgradeBuilding, isLoading
  } = useGameStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [guildName, setGuildName] = useState('')
  const [contributeGold, setContributeGold] = useState(100)
  const [selectedMaterial, setSelectedMaterial] = useState<string>('')
  const [materialQty, setMaterialQty] = useState(1)

  useEffect(() => {
    fetchGuilds()
    fetchMaterials()
  }, [fetchGuilds, fetchMaterials])

  const handleCreate = async () => {
    if (!guildName.trim()) return
    await createGuild(guildName.trim())
    setShowCreateModal(false)
    setGuildName('')
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-amber-400" />
            考古公会
          </h2>
          <p className="text-gray-400 mt-1">加入公会，享受团队加成和特殊福利</p>
        </div>
        {!myGuild && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            创建公会
          </button>
        )}
      </div>

      {myGuild ? (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4 space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{myGuild.name}</h3>
                  <p className="text-gray-400 text-sm">Lv.{myGuild.level} · {myGuild.members?.length || 0} 名成员</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-400 font-bold">声望: {myGuild.reputation}</p>
                  <p className="text-yellow-400 text-sm">金库: {formatNumber(myGuild.gold)}</p>
                </div>
              </div>
              {myGuild.myRole !== 'member' && (
                <button
                  onClick={leaveGuild}
                  className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {myGuild.myRole === 'leader' ? '解散公会' : '退出公会'}
                </button>
              )}
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h4 className="font-bold text-white mb-4">贡献资源</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">金币贡献</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={contributeGold}
                      onChange={e => setContributeGold(Number(e.target.value))}
                      className="flex-1 px-3 py-2 bg-slate-800/70 border border-slate-700 rounded-lg text-white outline-none"
                    />
                    <button
                      onClick={() => contributeToGuild(contributeGold)}
                      disabled={contributeGold > user.gold || isLoading}
                      className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 disabled:opacity-50 transition-colors"
                    >
                      贡献
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">材料贡献</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedMaterial}
                      onChange={e => setSelectedMaterial(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-800/70 border border-slate-700 rounded-lg text-white outline-none"
                    >
                      <option value="">选择材料</option>
                      {materials.filter(m => m.quantity > 0).map(m => (
                        <option key={m.id} value={m.id}>{m.name} (x{m.quantity})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={materialQty}
                      onChange={e => setMaterialQty(Number(e.target.value))}
                      className="w-20 px-2 py-2 bg-slate-800/70 border border-slate-700 rounded-lg text-white outline-none"
                    />
                    <button
                      onClick={() => selectedMaterial && contributeToGuild(0, selectedMaterial, materialQty)}
                      disabled={!selectedMaterial || isLoading}
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-50 transition-colors"
                    >
                      贡献
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-8 space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h4 className="font-bold text-white mb-4">公会建筑</h4>
              <div className="grid grid-cols-2 gap-4">
                {myGuild.buildings?.map((b: any) => (
                  <div key={b.id} className="p-4 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-white font-semibold">{b.name}</p>
                        <p className="text-gray-400 text-sm">Lv.{b.level}/{b.maxLevel}</p>
                      </div>
                      {myGuild.myRole !== 'member' && b.level < b.maxLevel && (
                        <button
                          onClick={() => upgradeBuilding(b.id)}
                          className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 text-sm flex items-center gap-1"
                        >
                          <ArrowUp className="w-3 h-3" />
                          升级
                        </button>
                      )}
                    </div>
                    <p className="text-green-400 text-sm">{b.bonus}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h4 className="font-bold text-white mb-4">成员列表</h4>
              <div className="space-y-2">
                {myGuild.members?.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        {m.role === 'leader' ? <Crown className="w-5 h-5 text-yellow-400" /> : <Users className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <p className="text-white font-medium">{m.userName}</p>
                        <p className="text-gray-400 text-xs">
                          {m.role === 'leader' ? '会长' : m.role === 'vice_leader' ? '副会长' : '会员'}
                        </p>
                      </div>
                    </div>
                    <p className="text-amber-400 text-sm">贡献: {formatNumber(m.contribution)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {guilds.map(guild => (
            <div key={guild.id} className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{guild.name}</h3>
                  <p className="text-gray-400 text-sm">Lv.{guild.level} · 会长: {guild.leaderName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div><span className="text-gray-400">声望:</span> <span className="text-amber-400">{guild.reputation}</span></div>
                <div><span className="text-gray-400">成员:</span> <span className="text-white">{guild.members?.length || 0}</span></div>
              </div>
              <button
                onClick={() => joinGuild(guild.id)}
                disabled={isLoading}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all"
              >
                申请加入
              </button>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">创建公会</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">公会名称</label>
                <input
                  type="text"
                  value={guildName}
                  onChange={e => setGuildName(e.target.value)}
                  placeholder="输入公会名称"
                  className="w-full px-4 py-3 bg-slate-800/70 border border-slate-700 rounded-lg text-white outline-none focus:border-purple-500"
                />
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm">
                <p className="text-yellow-400">创建需要: 10,000 金币</p>
                <p className="text-gray-400 mt-1">当前金币: {formatNumber(user.gold)}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!guildName.trim() || user.gold < 10000 || isLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white rounded-lg font-medium transition-all"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
