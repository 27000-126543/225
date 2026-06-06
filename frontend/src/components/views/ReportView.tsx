import { useState, useEffect } from 'react'
import { ScrollText, Download, FileText, TrendingUp, PieChart, Radar, LineChart } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar,
  ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Tooltip, Legend,
  LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid
} from 'recharts'
import jsPDF from 'jspdf'

export const ReportView = () => {
  const { user, fetchReport, fetchLeaderboard } = useGameStore()
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadReport()
    }
  }, [user])

  const loadReport = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await fetchReport(user.id)
      setReportData(data)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const exportPDF = () => {
    if (!reportData) return
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('考古数据报告', 105, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.text(`玩家: ${reportData.user?.username || ''}`, 20, 40)
    doc.text(`博物馆评分: ${reportData.user?.museumScore || 0}`, 20, 55)
    doc.text(`总文物数: ${reportData.totalArtifacts || 0}`, 20, 70)
    doc.text(`已修复: ${reportData.repairedCount || 0}`, 20, 85)
    doc.text(`平均评分: ${reportData.avgScore || 0}`, 20, 100)
    doc.save(`考古报告_${reportData.user?.username || 'player'}.pdf`)
  }

  const radarData = reportData?.rarityDistribution?.length ? [
    { subject: '普通', A: reportData.rarityDistribution.find((d: any) => d.name === 'common')?.value || 0, fullMark: 20 },
    { subject: '优秀', A: reportData.rarityDistribution.find((d: any) => d.name === 'uncommon')?.value || 0, fullMark: 20 },
    { subject: '稀有', A: reportData.rarityDistribution.find((d: any) => d.name === 'rare')?.value || 0, fullMark: 20 },
    { subject: '史诗', A: reportData.rarityDistribution.find((d: any) => d.name === 'epic')?.value || 0, fullMark: 20 },
    { subject: '传说', A: reportData.rarityDistribution.find((d: any) => d.name === 'legendary')?.value || 0, fullMark: 20 },
  ] : []

  const PIE_COLORS = ['#6b7280', '#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b']

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ScrollText className="w-7 h-7 text-amber-400" />
            数据报告
          </h2>
          <p className="text-gray-400 mt-1">查看你的考古生涯数据，导出PDF报告</p>
        </div>
        <button
          onClick={exportPDF}
          disabled={!reportData || loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
        >
          <Download className="w-5 h-5" />
          导出PDF
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="text-gray-400 text-sm">总文物数</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">{reportData?.totalArtifacts || 0}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="text-gray-400 text-sm">已修复</div>
          <div className="text-2xl font-bold text-green-400 mt-1">{reportData?.repairedCount || 0}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="text-gray-400 text-sm">平均评分</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{reportData?.avgScore || 0}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="text-gray-400 text-sm">博物馆评分</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{user.museumScore}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Radar className="w-5 h-5 text-purple-400" />
            藏品稀有度分布
          </h3>
          <div className="h-72">
            {radarData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsRadar data={radarData}>
                  <PolarGrid stroke="#4b5563" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <PolarRadiusAxis stroke="#4b5563" />
                  <RechartsRadar
                    name="数量"
                    dataKey="A"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.5}
                  />
                </RechartsRadar>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-400" />
            年代分布
          </h3>
          <div className="h-72">
            {reportData?.eraDistribution?.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={reportData.eraDistribution.map((d: any) => ({
                      ...d,
                      name: d.name === 'ancient' ? '远古' :
                            d.name === 'classical' ? '古典' :
                            d.name === 'medieval' ? '中世纪' :
                            d.name === 'renaissance' ? '文艺复兴' : '近代'
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {reportData.eraDistribution.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 col-span-2">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-green-400" />
            近7天挖掘趋势
          </h3>
          <div className="h-64">
            {reportData?.excavationTrend?.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLine data={reportData.excavationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="挖掘数量"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e' }}
                  />
                </RechartsLine>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
