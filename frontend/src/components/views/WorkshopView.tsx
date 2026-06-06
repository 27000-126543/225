import { useState, useEffect } from 'react'
import { Wrench, Search, Sparkles, Package, AlertTriangle, Loader2 } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { RarityBadge } from '../common/RarityBadge'
import { ProgressBar } from '../common/ProgressBar'
import { getEraText } from '../../utils/helpers'

export const WorkshopView = () => {
  const {
    artifacts, materials, user,
    fetchArtifacts, fetchMaterials,
    identifyArtifact, repairArtifact, isLoading
  } = useGameStore()
  const [activeTab, setActiveTab] = useState<'identify' | 'repair'>('identify')
  const [selectedArtifact, setSelectedArtifact] = useState<any>(null)
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])

  useEffect(() => {
    fetchArtifacts()
    fetchMaterials()
  }, [fetchArtifacts, fetchMaterials])

  const unidentifiedArtifacts = artifacts.filter(a => !a.isIdentified)
  const unrepairedArtifacts = artifacts.filter(a => a.isIdentified && !a.isRepaired)
  const repairedArtifacts = artifacts.filter(a => a.isRepaired)

  const handleIdentify = async () => {
    if (!selectedArtifact) return
    try {
      await identifyArtifact(selectedArtifact.id)
      setSelectedArtifact(null)
    } catch {}
  }

  const handleRepair = async () => {
    if (!selectedArtifact) return
    try {
      await repairArtifact(selectedArtifact.id, selectedMaterials)
      setSelectedArtifact(null)
      setSelectedMaterials([])
    } catch {}
  }

  const toggleMaterial = (matId: string) => {
    setSelectedMaterials(prev =>
      prev.includes(matId)
        ? prev.filter(id => id !== matId)
        : [...prev, matId]
    )
  }

  const requiredMaterials = selectedArtifact
    ? (selectedArtifact.rarity === 'legendary' ? 5 :
       selectedArtifact.rarity === 'epic' ? 4 :
       selectedArtifact.rarity === 'rare' ? 3 :
       selectedArtifact.rarity === 'uncommon' ? 2 : 1)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Wrench className="w-7 h-7 text-amber-400" />
          鉴定修复工作台
        </h2>
        <p className="text-gray-400 mt-1">鉴定文物价值，精心修复每件宝藏</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="text-gray-400 text-sm">待鉴定</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{unidentifiedArtifacts.length}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="text-gray-400 text-sm">待修复</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{unrepairedArtifacts.length}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="text-gray-400 text-sm">已修复</div>
          <div className="text-2xl font-bold text-green-400 mt-1">{repairedArtifacts.length}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="text-gray-400 text-sm">修复熟练度</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">{user?.restorerProficiency.toFixed(1)}%</div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setActiveTab('identify'); setSelectedArtifact(null) }}
          className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'identify'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-slate-800/50 text-gray-400 hover:text-white'
          }`}
        >
          <Search className="w-5 h-5" />
          文物鉴定
        </button>
        <button
          onClick={() => { setActiveTab('repair'); setSelectedArtifact(null); setSelectedMaterials([]) }}
          className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'repair'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'bg-slate-800/50 text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          文物修复
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            {activeTab === 'identify' ? '待鉴定文物' : '待修复文物'}
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {(activeTab === 'identify' ? unidentifiedArtifacts : unrepairedArtifacts).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无{activeTab === 'identify' ? '待鉴定' : '待修复'}的文物</p>
              </div>
            ) : (
              (activeTab === 'identify' ? unidentifiedArtifacts : unrepairedArtifacts).map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedArtifact(item)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedArtifact?.id === item.id
                      ? 'bg-purple-500/30 border-2 border-purple-500'
                      : 'bg-slate-800/50 border-2 border-transparent hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{item.image}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{item.name}</span>
                        <RarityBadge rarity={item.rarity} size="sm" />
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {getEraText(item.era)} · 完整度 {item.completeness}%
                      </div>
                      {item.isIdentified && (
                        <div className="text-sm text-amber-400 mt-1">
                          评分: {item.score}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            {activeTab === 'identify' ? '鉴定详情' : '修复详情'}
          </h3>
          {!selectedArtifact ? (
            <div className="text-center py-16 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>请选择一件文物</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-6xl">{selectedArtifact.image}</span>
                <h4 className="text-xl font-bold text-white mt-3">{selectedArtifact.name}</h4>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <RarityBadge rarity={selectedArtifact.rarity} />
                  <span className="text-gray-400">{getEraText(selectedArtifact.era)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">完整度</span>
                    <span className="text-white">{selectedArtifact.completeness}%</span>
                  </div>
                  <ProgressBar
                    value={selectedArtifact.completeness}
                    max={100}
                    color={selectedArtifact.completeness > 70 ? 'green' : selectedArtifact.completeness > 40 ? 'yellow' : 'red'}
                  />
                </div>
                {selectedArtifact.isIdentified && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">评分</span>
                      <span className="text-amber-400 font-bold">{selectedArtifact.score}</span>
                    </div>
                  </div>
                )}
              </div>

              {activeTab === 'repair' && (
                <div>
                  <h5 className="text-white font-semibold mb-3">
                    选择材料 ({selectedMaterials.length}/{requiredMaterials})
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    {materials.filter(m => m.quantity > 0).map(mat => (
                      <div
                        key={mat.id}
                        onClick={() => toggleMaterial(mat.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all text-sm ${
                          selectedMaterials.includes(mat.id)
                            ? 'bg-green-500/30 border border-green-500'
                            : 'bg-slate-800/50 border border-transparent hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white">{mat.name}</span>
                          <span className="text-gray-400">x{mat.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={activeTab === 'identify' ? handleIdentify : handleRepair}
                disabled={isLoading || (activeTab === 'repair' && selectedMaterials.length < requiredMaterials)}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                  isLoading
                    ? 'bg-gray-600 cursor-wait'
                    : activeTab === 'repair' && selectedMaterials.length < requiredMaterials
                    ? 'bg-gray-600 cursor-not-allowed'
                    : activeTab === 'identify'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500'
                }`}
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading ? '处理中...' : activeTab === 'identify' ? '开始鉴定' : '开始修复'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
