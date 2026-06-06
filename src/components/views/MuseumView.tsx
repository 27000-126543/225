import { useState } from 'react'
import { Building2, Ticket, Star, Trash2, Eye } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { RarityBadge } from '../common/RarityBadge'
import { StatCard } from '../common/StatCard'
import { getEraText, formatNumber } from '../../utils/helpers'
import { Artifact } from '../../types'

export const MuseumView = () => {
  const { museumHalls, artifacts, placeArtifact, removeArtifact, player } = useGameStore()
  const [selectedHall, setSelectedHall] = useState<string>(museumHalls[0]?.id || '')
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('view')

  const repairedArtifacts = artifacts.filter(a => a.isRepaired && a.isIdentified)
  const currentHall = museumHalls.find(h => h.id === selectedHall)

  const getPlacedArtifactIds = () => {
    const ids: string[] = []
    museumHalls.forEach(hall => {
      hall.slots.forEach(slot => {
        if (slot.artifactId) ids.push(slot.artifactId)
      })
    })
    return ids
  }

  const availableArtifacts = repairedArtifacts.filter(a => !getPlacedArtifactIds().includes(a.id))

  const handleSlotClick = (slotId: string) => {
    if (viewMode === 'edit' && selectedArtifact) {
      placeArtifact(selectedArtifact.id, selectedHall, slotId)
      setSelectedArtifact(null)
    }
  }

  const handleRemoveArtifact = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeArtifact(selectedHall, slotId)
  }

  const dailyTicketIncome = Math.floor(player.museumScore * 0.5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-purple-400" />
            地下博物馆
          </h2>
          <p className="text-gray-400 mt-1">布置展厅，展示你的珍贵收藏</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode(viewMode === 'view' ? 'edit' : 'view')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
              viewMode === 'edit'
                ? 'bg-green-600 text-white'
                : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
            }`}
          >
            {viewMode === 'edit' ? <Eye className="w-4 h-4" /> : <Star className="w-4 h-4" />}
            {viewMode === 'edit' ? '完成布置' : '编辑布局'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={<Star className="text-yellow-400" />} label="博物馆评分" value={formatNumber(player.museumScore)} subValue="综合评分" color="yellow" />
        <StatCard icon={<Ticket className="text-green-400" />} label="每日门票收入" value={`${formatNumber(dailyTicketIncome)} 金币`} subValue="预计收益" color="green" />
        <StatCard icon={<Building2 className="text-blue-400" />} label="已解锁展厅" value={`${museumHalls.filter(h => h.unlocked).length}/${museumHalls.length}`} subValue="展厅数量" color="blue" />
        <StatCard icon={<Star className="text-purple-400" />} label="已展示藏品" value={`${getPlacedArtifactIds().length}/${repairedArtifacts.length}`} subValue="藏品总数" color="purple" />
      </div>

      <div className="flex gap-3">
        {museumHalls.map(hall => (
          <button
            key={hall.id}
            onClick={() => hall.unlocked && setSelectedHall(hall.id)}
            disabled={!hall.unlocked}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              selectedHall === hall.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : hall.unlocked
                ? 'bg-purple-500/10 text-gray-300 hover:text-white hover:bg-purple-500/20'
                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
            }`}
          >
            {hall.unlocked ? hall.name : `🔒 ${hall.name}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          {currentHall && (
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{currentHall.name}</h3>
                  <p className="text-gray-400 text-sm">主题: {getEraText(currentHall.theme as any)}</p>
                </div>
                <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-lg">
                  <Ticket className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">门票加成: x{currentHall.ticketBonus}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {currentHall.slots.map(slot => {
                  const artifact = slot.artifactId
                    ? artifacts.find(a => a.id === slot.artifactId)
                    : null
                  return (
                    <div
                      key={slot.id}
                      onClick={() => handleSlotClick(slot.id)}
                      className={`relative rounded-xl p-6 flex flex-col items-center justify-center transition-all min-h-40 ${
                        artifact
                          ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-500/50'
                          : viewMode === 'edit'
                          ? 'bg-purple-500/10 border-2 border-dashed border-purple-500/50 cursor-pointer hover:bg-purple-500/20'
                          : 'bg-gray-800/50 border-2 border-gray-700'
                      } ${slot.size === 'large' ? 'col-span-1 row-span-1' : ''}`}
                    >
                      {artifact ? (
                        <>
                          <span className="text-5xl mb-2">{artifact.image}</span>
                          <p className="text-white font-semibold text-sm text-center">{artifact.name}</p>
                          <RarityBadge rarity={artifact.rarity} size="sm" />
                          <p className="text-yellow-400 text-xs mt-1 font-bold">{artifact.score} 分</p>
                          {viewMode === 'edit' && (
                            <button
                              onClick={(e) => handleRemoveArtifact(slot.id, e)}
                              className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-lg hover:bg-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="text-center">
                          <span className="text-4xl opacity-30">🖼️</span>
                          <p className="text-gray-500 text-sm mt-2">
                            {viewMode === 'edit' ? '点击放置藏品' : '空置展位'}
                          </p>
                          <p className="text-gray-600 text-xs">
                            {slot.size === 'large' ? '大型展位' : slot.size === 'medium' ? '中型展位' : '小型展位'}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {viewMode === 'edit' && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">可用藏品</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableArtifacts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">没有可放置的藏品</p>
                ) : (
                  availableArtifacts.map(artifact => (
                    <div
                      key={artifact.id}
                      onClick={() => setSelectedArtifact(artifact)}
                      className={`p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                        selectedArtifact?.id === artifact.id
                          ? 'bg-purple-500/30 border border-purple-500'
                          : 'bg-purple-500/10 hover:bg-purple-500/20'
                      }`}
                    >
                      <span className="text-2xl">{artifact.image}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{artifact.name}</p>
                        <RarityBadge rarity={artifact.rarity} size="sm" />
                      </div>
                      <p className="text-yellow-400 text-sm font-bold">{artifact.score}</p>
                    </div>
                  ))
                )}
              </div>
              {selectedArtifact && (
                <p className="text-purple-300 text-xs mt-3 text-center">
                  已选择「{selectedArtifact.name}」，点击展位放置
                </p>
              )}
            </div>
          )}

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">博物馆数据</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">总藏品数</span>
                <span className="text-white font-medium">{player.totalArtifacts}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">修复成功率</span>
                <span className="text-white font-medium">{player.repairSuccessRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">修复师等级</span>
                <span className="text-white font-medium">Lv.{Math.floor(player.restorerProficiency / 10) + 1}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">挖掘深度</span>
                <span className="text-white font-medium">{player.excavationDepth}m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
