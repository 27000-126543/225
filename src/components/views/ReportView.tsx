import { useState } from 'react'
import { ScrollText, Download, PieChart, TrendingUp, BarChart } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts'
import jsPDF from 'jspdf'
import { formatNumber, getEraText, getRarityText } from '../../utils/helpers'

export const ReportView = () => {
  const { artifacts, player } = useGameStore()
  const [generating, setGenerating] = useState(false)

  const eraDistribution = [
    { era: '远古时代', count: artifacts.filter(a => a.era === 'ancient' && a.isRepaired).length },
    { era: '古典时代', count: artifacts.filter(a => a.era === 'classical' && a.isRepaired).length },
    { era: '中世纪', count: artifacts.filter(a => a.era === 'medieval' && a.isRepaired).length },
    { era: '文艺复兴', count: artifacts.filter(a => a.era === 'renaissance' && a.isRepaired).length },
    { era: '近代', count: artifacts.filter(a => a.era === 'modern' && a.isRepaired).length },
  ]

  const rarityData = [
    { name: '普通', value: artifacts.filter(a => a.rarity === 'common' && a.isRepaired).length, color: '#9ca3af' },
    { name: '优秀', value: artifacts.filter(a => a.rarity === 'uncommon' && a.isRepaired).length, color: '#22c55e' },
    { name: '稀有', value: artifacts.filter(a => a.rarity === 'rare' && a.isRepaired).length, color: '#3b82f6' },
    { name: '史诗', value: artifacts.filter(a => a.rarity === 'epic' && a.isRepaired).length, color: '#a855f7' },
    { name: '传说', value: artifacts.filter(a => a.rarity === 'legendary' && a.isRepaired).length, color: '#f59e0b' },
  ].filter(d => d.value > 0)

  const excavationTrend = [
    { date: '周一', count: 8 },
    { date: '周二', count: 12 },
    { date: '周三', count: 6 },
    { date: '周四', count: 15 },
    { date: '周五', count: 10 },
    { date: '周六', count: 20 },
    { date: '周日', count: 18 },
  ]

  const radarData = [
    { subject: '稀有度', A: 75, fullMark: 100 },
    { subject: '年代', A: 68, fullMark: 100 },
    { subject: '完整度', A: 82, fullMark: 100 },
    { subject: '词缀', A: 55, fullMark: 100 },
    { subject: '评分', A: 90, fullMark: 100 },
    { subject: '数量', A: 60, fullMark: 100 },
  ]

  const generatePDF = () => {
    setGenerating(true)
    setTimeout(() => {
      const doc = new jsPDF()

      doc.setFontSize(20)
      doc.text('Magic Ruins Archaeology Museum Report', 105, 20, { align: 'center' })
      doc.setFontSize(12)
      doc.text(`Generated for: ${player.name}`, 105, 35, { align: 'center' })
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 45, { align: 'center' })

      doc.setFontSize(16)
      doc.text('Player Statistics', 20, 65)
      doc.setFontSize(12)
      doc.text(`Museum Score: ${formatNumber(player.museumScore)}`, 20, 80)
      doc.text(`Total Artifacts: ${player.totalArtifacts}`, 20, 90)
      doc.text(`Excavation Depth: ${player.excavationDepth}m`, 20, 100)
      doc.text(`Repair Success Rate: ${player.repairSuccessRate}%`, 20, 110)
      doc.text(`Restorer Proficiency: ${player.restorerProficiency.toFixed(1)}`, 20, 120)

      doc.setFontSize(16)
      doc.text('Artifact Distribution by Era', 20, 145)
      doc.setFontSize(12)
      eraDistribution.forEach((item, index) => {
        doc.text(`${item.era}: ${item.count} pieces`, 20, 160 + index * 10)
      })

      doc.addPage()
      doc.setFontSize(16)
      doc.text('Artifact Collection', 20, 20)
      doc.setFontSize(10)
      const repaired = artifacts.filter(a => a.isRepaired)
      repaired.slice(0, 20).forEach((art, index) => {
        const y = 35 + index * 8
        if (y > 270) return
        doc.text(`${art.name} - ${getRarityText(art.rarity)} - ${getEraText(art.era)} - Score: ${art.score}`, 20, y)
      })

      doc.save(`museum_report_${Date.now()}.pdf`)
      setGenerating(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ScrollText className="w-7 h-7 text-purple-400" />
            数据报告
          </h2>
          <p className="text-gray-400 mt-1">查看和导出你的考古数据统计</p>
        </div>
        <button
          onClick={generatePDF}
          disabled={generating}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          {generating ? '生成中...' : '导出PDF报告'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm">博物馆评分</p>
          <p className="text-2xl font-bold text-yellow-400">{formatNumber(player.museumScore)}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm">文物总数</p>
          <p className="text-2xl font-bold text-purple-400">{player.totalArtifacts}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm">挖掘深度</p>
          <p className="text-2xl font-bold text-blue-400">{player.excavationDepth}m</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm">修复成功率</p>
          <p className="text-2xl font-bold text-green-400">{player.repairSuccessRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-400" />
            藏品年代分布
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={eraDistribution.filter(d => d.count > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ era, percent }) => `${era} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {eraDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-yellow-400" />
            稀有度分布
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={rarityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {rarityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            本周挖掘趋势
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={excavationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #6366f1', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-blue-400" />
            藏品能力雷达图
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                <PolarRadiusAxis stroke="#6b7280" />
                <Radar name="评分" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
