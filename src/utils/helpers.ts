import { Rarity, Era, Weather, ToolQuality } from '../types'

export const getRarityText = (rarity: Rarity): string => {
  const map: Record<Rarity, string> = {
    common: '普通',
    uncommon: '优秀',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  }
  return map[rarity]
}

export const getRarityColor = (rarity: Rarity): string => {
  const map: Record<Rarity, string> = {
    common: 'text-gray-400',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400'
  }
  return map[rarity]
}

export const getRarityBgColor = (rarity: Rarity): string => {
  const map: Record<Rarity, string> = {
    common: 'bg-gray-700/50',
    uncommon: 'bg-green-900/50',
    rare: 'bg-blue-900/50',
    epic: 'bg-purple-900/50',
    legendary: 'bg-yellow-900/50'
  }
  return map[rarity]
}

export const getRarityBorderColor = (rarity: Rarity): string => {
  const map: Record<Rarity, string> = {
    common: 'border-gray-500',
    uncommon: 'border-green-500',
    rare: 'border-blue-500',
    epic: 'border-purple-500',
    legendary: 'border-yellow-500'
  }
  return map[rarity]
}

export const getEraText = (era: Era): string => {
  const map: Record<Era, string> = {
    ancient: '远古时代',
    classical: '古典时代',
    medieval: '中世纪',
    renaissance: '文艺复兴',
    modern: '近代'
  }
  return map[era]
}

export const getWeatherText = (weather: Weather): string => {
  const map: Record<Weather, string> = {
    sunny: '☀️ 晴朗',
    cloudy: '⛅ 多云',
    rainy: '🌧️ 雨天',
    stormy: '⛈️ 暴风雨',
    magical: '✨ 魔法天气'
  }
  return map[weather]
}

export const getToolQualityText = (quality: ToolQuality): string => {
  const map: Record<ToolQuality, string> = {
    basic: '基础',
    good: '良好',
    excellent: '精良',
    masterwork: '大师',
    legendary: '传说'
  }
  return map[quality]
}

export const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return `${seconds}秒前`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

export const formatNumber = (num: number): string => {
  return num.toLocaleString()
}
