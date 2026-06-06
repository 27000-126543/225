import { useState } from 'react'
import { Users, Building, Crown, Shield, Coins, Package, ArrowUp } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { formatNumber } from '../../utils/helpers'

export const GuildView = () => {
  const { guild, materials, contributeToGuild, upgradeGuildBuilding, player } = useGameStore()
  const [selectedMaterial, setSelectedMaterial] = useState<string>('')
  const [contributeAmount, setContributeAmount] = useState<number>(1)
  const [message, setMessage] = useState<string>('')

  const myMember = guild.members.find(m => m.id === player.id)

  const handleContribute = () => {
    if (!selectedMaterial || contributeAmount <= 0) return
    contributeToGuild(selectedMaterial, contributeAmount)
    setMessage('贡献成功！')
    setTimeout(() => setMessage(''), 2000)
  }

  const handleUpgrade = (buildingId: string) => {
    const result = upgradeGuildBuilding(buildingId)
    setMessage(result.message)
    setTimeout(() => setMessage(''), 3000)
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'leader': return '👑 会长'
      case 'vice': return '⚔️ 副会长'
      default: return '👤 会员'
    }
  }

  const getBuildingIcon = (type: string) => {
    switch (type) {
      case 'excavation_site': return '⛏️'
      case 'repair_room': return '🔧'
      case 'library': return '📚'
      case 'warehouse': return '📦'
      default: return '🏠'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-400" />
            {guild.name}
          </h2>
          <p className="text-gray-400 mt-1">等级 {guild.level} · 声望 {formatNumber(guild.reputation)}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-bold">{formatNumber(guild.gold)} 公会金币</span>
          </div>
          {myMember && (
            <div className="flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-lg">
              <Crown className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300">我的贡献: {formatNumber(myMember.contribution)}</span>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/50 text-green-300 font-medium">
          {message}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-400" />
              公会建筑
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {guild.buildings.map(building => (
                <div key={building.id} className="bg-purple-500/10 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{getBuildingIcon(building.type)}</span>
                    <div>
                      <h4 className="text-white font-bold">{building.name}</h4>
                      <p className="text-purple-400 text-sm">等级 {building.level}/{building.maxLevel}</p>
                    </div>
                  </div>
                  <p className="text-green-400 text-sm mb-3">✨ {building.bonus}</p>
                  {building.level < building.maxLevel && (
                    <div className="space-y-2">
                      <p className="text-gray-400 text-xs">升级需要:</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-yellow-400">{formatNumber(building.upgradeCost.gold)} 金币</span>
                        {Object.entries(building.upgradeCost.materials).map(([matId, amount]) => {
                          const mat = materials.find(m => m.id === matId)
                          return (
                            <span key={matId} className="text-gray-300">
                              {amount} {mat?.name || '材料'}
                            </span>
                          )
                        })}
                      </div>
                      <button
                        onClick={() => handleUpgrade(building.id)}
                        disabled={!(myMember?.role === 'leader' || myMember?.role === 'vice')}
                        className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                          myMember?.role === 'leader' || myMember?.role === 'vice'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ArrowUp className="w-4 h-4 inline mr-1" />
                        升级建筑
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              公会成员 ({guild.members.length})
            </h3>
            <div className="space-y-2">
              {guild.members.map(member => (
                <div
                  key={member.id}
                  className={`flex items-center gap-4 p-3 rounded-xl ${
                    member.id === player.id ? 'bg-purple-500/30' : 'bg-purple-500/10'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    {member.role === 'leader' ? '👑' : member.role === 'vice' ? '⚔️' : '👤'}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{member.name}</p>
                    <p className="text-gray-400 text-sm">{getRoleText(member.role)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-300 font-medium">{formatNumber(member.contribution)}</p>
                    <p className="text-gray-500 text-xs">贡献值</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              公会仓库
            </h3>
            <div className="space-y-2">
              {Object.entries(guild.materials).map(([matId, amount]) => {
                const mat = materials.find(m => m.id === matId)
                return (
                  <div key={matId} className="flex items-center justify-between p-2 bg-purple-500/10 rounded-lg">
                    <span className="text-white text-sm">{mat?.name || '未知材料'}</span>
                    <span className="text-purple-300 font-bold">{amount}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">贡献材料</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">选择材料</label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">请选择</option>
                  {materials.filter(m => m.quantity > 0).map(mat => (
                    <option key={mat.id} value={mat.id}>{mat.name} (库存: {mat.quantity})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">贡献数量</label>
                <input
                  type="number"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(Math.max(1, Number(e.target.value)))}
                  min={1}
                  className="w-full px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                onClick={handleContribute}
                disabled={!selectedMaterial}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  selectedMaterial
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                确认贡献
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              公会特权
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                联合挖掘场加成
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                大师修复室加成
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                图书馆知识加成
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                仓库扩容
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                遗迹争夺战参与权
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
