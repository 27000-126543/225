import { useState, useEffect } from 'react'
import { Building2, Plus, Trash2, Eye, Edit } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { RarityBadge } from '../common/RarityBadge'
import { StatCard } from '../common/StatCard'
import { getEraText } from '../../utils/helpers'

export const MuseumView = () => {
  const {
    museumHalls, artifacts, user,
    fetchMuseumHalls, fetchArtifacts,
    placeArtifact, removeArtifact
  } = useGameStore()
  const [selectedHall, setSelectedHall] = useState<string>('')
  const [editMode, setEditMode] = useState(false)
  const [selectedArtifact, setSelectedArtifact] = useState<any>(null)
  const [availableArtifacts, setAvailableArtifacts] = useState<any[]>([])

  useEffect(() => {
    fetchMuseumHalls()
    fetchArtifacts()
  }, [fetchMuseumHalls, fetchArtifacts])

  useEffect(() => {
    if (museumHalls.length > 0 && !selectedHall) {
      setSelectedHall(museumHalls[0].id)
    }
    const placedIds = museumHalls.flatMap(h => h.items?.map((i: any) => i.artifact?.id) || [])
    setAvailableArtifacts(artifacts.filter(a => a.isRepaired && !placedIds.includes(a.id)))
  }, [museumHalls, artifacts, selectedHall])

  const currentHall = museumHalls.find(h => h.id === selectedHall)

  const handlePlace = (artifact: any) => {
    if (!selectedHall) return
    const x = Math.floor(Math.random() * 3)
    const y = Math.floor(Math.random() * 3)
    placeArtifact(selectedHall, artifact.id, { x, y }, 'medium')
    setSelectedArtifact(null)
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-amber-400" />
            地下博物馆
          </h2>
          <p className="text-gray-400 mt-1">布置你的藏品，赚取门票收入</p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            editMode
              ? 'bg-green-600 text-white'
              : 'bg-purple-600 text-white hover:bg-purple-500'
          }`}
        >
          {editMode ? <Eye className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
          {editMode ? '查看模式' : '编辑模式'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={<Building2 className="text-purple-400" />} label="博物馆评分" value={user.museumScore} color="purple" />
        <StatCard icon={<Plus className="text-green-400" />} label="每日门票收入" value={`${Math.floor(user.museumScore / 10) * 10 * 24}`} subValue="金币" color="green" />
        <StatCard icon={<Building2 className="text-blue-400" />} label="展厅数量" value={museumHalls.length} color="blue" />
        <StatCard icon={<Building2 className="text-amber-400" />} label="展品数量" value={museumHalls.reduce((s, h) => s + (h.items?.length || 0), 0)} color="amber" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3 space-y-2">
          <h3 className="text-lg font-bold text-white mb-3">主题展厅</h3>
          {museumHalls.map(hall => (
            <div
              key={hall.id}
              onClick={() => setSelectedHall(hall.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                selectedHall === hall.id
                  ? 'bg-purple-600 text-white'
                  : 'glass-card hover:bg-purple-500/20'
              }`}
            >
              <p className="font-semibold">{hall.name}</p>
              <p className="text-sm opacity-70">{hall.items?.length || 0} 件展品</p>
            </div>
          ))}
        </div>

        <div className="col-span-6">
          <div className="glass-card rounded-2xl p-6 min-h-[500px]">
            <h3 className="text-lg font-bold text-white mb-4">
              {currentHall?.name || '选择展厅'}
            </h3>
            {!currentHall ? (
              <div className="text-center py-20 text-gray-500">请选择展厅</div>
            ) : currentHall.items?.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>展厅空空如也</p>
                {editMode && <p className="text-sm mt-2">从右侧选择文物进行布置</p>}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {currentHall.items?.map((item: any) => (
                  <div
                    key={item.slotId}
                    className={`p-4 rounded-xl text-center transition-all ${
                      editMode ? 'hover:bg-red-500/20 cursor-pointer' : 'bg-purple-500/10'
                    } bg-purple-500/10`}
                    onClick={() => editMode && removeArtifact(item.slotId)}
                  >
                    <span className="text-5xl">{item.artifact?.image}</span>
                    <p className="text-white text-sm mt-2 font-medium">{item.artifact?.name}</p>
                    <RarityBadge rarity={item.artifact?.rarity} size="sm" />
                    <p className="text-xs text-gray-400 mt-1">评分: {item.artifact?.score}</p>
                    {editMode && (
                      <div className="mt-2 text-xs text-red-400 flex items-center justify-center gap-1">
                        <Trash2 className="w-3 h-3" /> 点击移除
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-3">
          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-lg font-bold text-white mb-4">可用藏品</h3>
            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
              {!editMode ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  切换到编辑模式布置展品
                </div>
              ) : availableArtifacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  暂无可布置的文物
                </div>
              ) : (
                availableArtifacts.map(art => (
                  <div
                    key={art.id}
                    onClick={() => handlePlace(art)}
                    className="p-3 rounded-lg bg-slate-800/50 hover:bg-purple-500/20 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{art.image}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{art.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <RarityBadge rarity={art.rarity} size="sm" />
                          <span className="text-xs text-gray-400">{getEraText(art.era)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
