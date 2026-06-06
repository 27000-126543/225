import { useState } from 'react'
import { Wrench, Search, Sparkles, Package, AlertTriangle } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { RarityBadge } from '../common/RarityBadge'
import { ProgressBar } from '../common/ProgressBar'
import { getEraText } from '../../utils/helpers'
import { Artifact } from '../../types'

export const WorkshopView = () => {
  const { artifacts, materials, identifyArtifact, repairArtifact, player } = useGameStore()
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'identify' | 'repair'>('identify')
  const [message, setMessage] = useState<string>('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning'>('success')
  const [isProcessing, setIsProcessing] = useState(false)

  const unidentifedArtifacts = artifacts.filter(a => !a.isIdentified)
  const identifiedUnrepairedArtifacts = artifacts.filter(a => a.isIdentified && !a.isRepaired)
  const repairedArtifacts = artifacts.filter(a => a.isRepaired)

  const showMessage = (msg: string, type: 'success' | 'error' | 'warning') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 4000)
  }

  const handleIdentify = () => {
    if (!selectedArtifact || selectedArtifact.isIdentified) return
    setIsProcessing(true)
    setTimeout(() => {
      const result = identifyArtifact(selectedArtifact.id)
      showMessage(result.message, result.success ? 'success' : 'error')
      setSelectedArtifact(null)
      setIsProcessing(false)
    }, 1500)
  }

  const handleRepair = () => {
    if (!selectedArtifact || selectedArtifact.isRepaired) return
    setIsProcessing(true)
    setTimeout(() => {
      const result = repairArtifact(selectedArtifact.id, selectedMaterials)
      showMessage(result.message, result.damaged ? 'warning' : result.success ? 'success' : 'error')
      setSelectedArtifact(null)
      setSelectedMaterials([])
      setIsProcessing(false)
    }, 2000)
  }

  const toggleMaterial = (matId: string) => {
    setSelectedMaterials(prev =>
      prev.includes(matId)
        ? prev.filter(id => id !== matId)
        : prev.length < 3 ? [...prev, matId] : prev
    )
  }

  const successRate = Math.min(95, player.restorerProficiency + selectedMaterials.length * 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-7 h-7 text-purple-400" />
            鉴定修复工作台
          </h2>
          <p className="text-gray-400 mt-1">鉴定文物价值，精心修复珍贵藏品</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-lg">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-purple-300">修复师熟练度: </span>
          <span className="text-white font-bold">{player.restorerProficiency.toFixed(1)}</span>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          messageType === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-300' :
          messageType === 'error' ? 'bg-red-500/20 border border-red-500/50 text-red-300' :
          'bg-yellow-500/20 border border-yellow-500/50 text-yellow-300'
        }`}>
          {messageType === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          <span className="font-medium">{message}</span>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('identify')}
          className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'identify'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-purple-500/10 text-gray-400 hover:text-white'
          }`}
        >
          <Search className="w-5 h-5" />
          文物鉴定
        </button>
        <button
          onClick={() => setActiveTab('repair')}
          className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'repair'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-purple-500/10 text-gray-400 hover:text-white'
          }`}
        >
          <Wrench className="w-5 h-5" />
          文物修复
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 col-span-2">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" />
            {activeTab === 'identify' ? '待鉴定物品' : '待修复物品'}
          </h3>

          <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {(activeTab === 'identify' ? unidentifedArtifacts : identifiedUnrepairedArtifacts).length === 0 ? (
              <div className="col-span-3 text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>没有需要{activeTab === 'identify' ? '鉴定' : '修复'}的物品</p>
              </div>
            ) : (
              (activeTab === 'identify' ? unidentifedArtifacts : identifiedUnrepairedArtifacts).map(artifact => (
                <div
                  key={artifact.id}
                  onClick={() => setSelectedArtifact(artifact)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                    selectedArtifact?.id === artifact.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-transparent bg-purple-500/10 hover:border-purple-500/50'
                  }`}
                >
                  <div className="text-center">
                    <span className="text-4xl">{artifact.image}</span>
                    <p className="text-white font-semibold mt-2 text-sm truncate">{artifact.name}</p>
                    <div className="mt-2">
                      <RarityBadge rarity={artifact.rarity} size="sm" />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{getEraText(artifact.era)}</p>
                    <div className="mt-2">
                      <ProgressBar value={artifact.completeness} max={100} color="purple" showText={false} height="h-1.5" />
                      <p className="text-xs text-gray-500 mt-1">完整度 {artifact.completeness}%</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">物品详情</h3>
            {selectedArtifact ? (
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-6xl">{selectedArtifact.image}</span>
                  <h4 className="text-xl font-bold text-white mt-3">{selectedArtifact.name}</h4>
                  <div className="flex justify-center mt-2">
                    <RarityBadge rarity={selectedArtifact.rarity} />
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">年代</span>
                    <span className="text-white">{getEraText(selectedArtifact.era)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">完整度</span>
                    <span className="text-white">{selectedArtifact.completeness}%</span>
                  </div>
                  {selectedArtifact.isIdentified && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">评分</span>
                      <span className="text-yellow-400 font-bold">{selectedArtifact.score}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-400 text-sm">{selectedArtifact.description}</p>

                {activeTab === 'identify' && !selectedArtifact.isIdentified && (
                  <button
                    onClick={handleIdentify}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold transition-all disabled:opacity-50"
                  >
                    {isProcessing ? '鉴定中...' : '🔍 开始鉴定'}
                  </button>
                )}

                {activeTab === 'repair' && selectedArtifact.isIdentified && !selectedArtifact.isRepaired && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">预测成功率</p>
                      <ProgressBar value={successRate} max={100} color="green" showText={true} height="h-3" />
                    </div>
                    <button
                      onClick={handleRepair}
                      disabled={isProcessing}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold transition-all disabled:opacity-50"
                    >
                      {isProcessing ? '修复中...' : '🔧 开始修复'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>选择一个物品查看详情</p>
              </div>
            )}
          </div>

          {activeTab === 'repair' && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">修复材料 (最多选3个)</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {materials.filter(m => m.quantity > 0).map(mat => (
                  <div
                    key={mat.id}
                    onClick={() => toggleMaterial(mat.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                      selectedMaterials.includes(mat.id)
                        ? 'bg-green-500/30 border border-green-500/50'
                        : 'bg-purple-500/10 hover:bg-purple-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🧪</span>
                      <div>
                        <p className="text-white text-sm font-medium">{mat.name}</p>
                        <p className="text-gray-400 text-xs">库存: {mat.quantity}</p>
                      </div>
                    </div>
                    <RarityBadge rarity={mat.rarity} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">已修复藏品 ({repairedArtifacts.length})</h3>
        <div className="grid grid-cols-6 gap-4">
          {repairedArtifacts.map(artifact => (
            <div key={artifact.id} className="bg-purple-500/10 rounded-xl p-4 text-center">
              <span className="text-3xl">{artifact.image}</span>
              <p className="text-white text-sm font-medium mt-2 truncate">{artifact.name}</p>
              <RarityBadge rarity={artifact.rarity} size="sm" />
              <p className="text-yellow-400 text-xs mt-1 font-bold">评分: {artifact.score}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
