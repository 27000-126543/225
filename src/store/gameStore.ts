import { create } from 'zustand'
import {
  Player, Artifact, RuinSite, ArchaeologyTeam, RepairMaterial,
  MuseumHall, MarketListing, Competition, Guild, Announcement,
  LeaderboardEntry, Rarity, Weather, ToolQuality
} from '../types'
import {
  mockPlayer, mockArtifacts, mockRuinSites, mockTeam,
  mockMaterials, mockMuseumHalls, mockMarketListings,
  mockCompetition, mockGuild, mockAnnouncements, mockLeaderboards
} from '../data/mockData'

interface GameState {
  player: Player
  artifacts: Artifact[]
  ruinSites: RuinSite[]
  team: ArchaeologyTeam
  materials: RepairMaterial[]
  museumHalls: MuseumHall[]
  marketListings: MarketListing[]
  competition: Competition
  guild: Guild
  announcements: Announcement[]
  leaderboards: {
    museum: LeaderboardEntry[]
    artifacts: LeaderboardEntry[]
    depth: LeaderboardEntry[]
    repair: LeaderboardEntry[]
  }
  currentView: string
  setCurrentView: (view: string) => void
  excavate: (ruinId: string) => { success: boolean; loot: Artifact | null; message: string }
  identifyArtifact: (artifactId: string) => { success: boolean; score: number; message: string }
  repairArtifact: (artifactId: string, materialIds: string[]) => { success: boolean; damaged: boolean; message: string }
  placeArtifact: (artifactId: string, hallId: string, slotId: string) => void
  removeArtifact: (hallId: string, slotId: string) => void
  listItem: (itemId: string, itemType: string, itemName: string, rarity: Rarity, price: number) => void
  buyItem: (listingId: string) => { success: boolean; message: string }
  joinCompetition: (artifactIds: string[]) => void
  contributeToGuild: (materialId: string, amount: number) => void
  upgradeGuildBuilding: (buildingId: string) => { success: boolean; message: string }
  addAnnouncement: (type: Announcement['type'], message: string) => void
  updateStamina: (amount: number) => void
  updateGold: (amount: number) => void
}

const calculateDropRate = (weather: Weather, toolQuality: ToolQuality, rarity: Rarity): number => {
  const weatherBonus: Record<Weather, number> = {
    sunny: 1.0,
    cloudy: 1.1,
    rainy: 0.9,
    stormy: 0.7,
    magical: 1.5
  }
  const toolBonus: Record<ToolQuality, number> = {
    basic: 1.0,
    good: 1.2,
    excellent: 1.5,
    masterwork: 2.0,
    legendary: 3.0
  }
  const baseRate: Record<Rarity, number> = {
    common: 0.5,
    uncommon: 0.3,
    rare: 0.12,
    epic: 0.05,
    legendary: 0.01
  }
  return baseRate[rarity] * weatherBonus[weather] * toolBonus[toolQuality]
}

const calculateScore = (rarity: Rarity, era: string, completeness: number): number => {
  const rarityMultiplier: Record<Rarity, number> = {
    common: 1,
    uncommon: 2,
    rare: 5,
    epic: 15,
    legendary: 50
  }
  const eraMultiplier: Record<string, number> = {
    ancient: 2.0,
    classical: 1.5,
    medieval: 1.2,
    renaissance: 1.0,
    modern: 0.8
  }
  return Math.floor(100 * rarityMultiplier[rarity] * eraMultiplier[era] * (completeness / 100))
}

const artifactNames = [
  '神秘符文石', '古代金币', '龙晶碎片', '精灵弓箭', '矮人战锤',
  '魔法水晶球', '时光沙漏', '星象仪', '炼金炉', '先知权杖',
  '守护者盾牌', '生命之树种子', '月亮碎片', '太阳徽章', '风暴核心'
]

const eras = ['ancient', 'classical', 'medieval', 'renaissance', 'modern'] as const
const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']
const weathers: Weather[] = ['sunny', 'cloudy', 'rainy', 'stormy', 'magical']
const affixes = [
  '魔力增幅', '考古效率', '修复成功率', '幸运加成', '体力恢复',
  '金币加成', '稀有掉落', '鉴定准确率', '龙语亲和', '月光祝福',
  '阳光抗性', '暗影之力', '元素掌控', '时间减缓', '空间跳跃'
]

export const useGameStore = create<GameState>((set, get) => ({
  player: mockPlayer,
  artifacts: mockArtifacts,
  ruinSites: mockRuinSites,
  team: mockTeam,
  materials: mockMaterials,
  museumHalls: mockMuseumHalls,
  marketListings: mockMarketListings,
  competition: mockCompetition,
  guild: mockGuild,
  announcements: mockAnnouncements,
  leaderboards: mockLeaderboards,
  currentView: 'excavation',

  setCurrentView: (view) => set({ currentView: view }),

  excavate: (ruinId) => {
    const state = get()
    const ruin = state.ruinSites.find(r => r.id === ruinId)
    if (!ruin) return { success: false, loot: null, message: '遗迹不存在' }
    if (state.player.stamina < ruin.staminaCost) {
      return { success: false, loot: null, message: '体力不足！' }
    }

    const weather = weathers[Math.floor(Math.random() * weathers.length)]
    const toolQuality = state.team.toolQuality

    let selectedRarity: Rarity = 'common'
    const roll = Math.random()
    let cumulative = 0
    for (const rarity of rarities) {
      cumulative += calculateDropRate(weather, toolQuality, rarity)
      if (roll < cumulative) {
        selectedRarity = rarity
        break
      }
    }

    const name = artifactNames[Math.floor(Math.random() * artifactNames.length)]
    const era = eras[Math.floor(Math.random() * eras.length)]
    const completeness = 20 + Math.floor(Math.random() * 40)
    const numAffixes = selectedRarity === 'legendary' ? 3 : selectedRarity === 'epic' ? 2 : selectedRarity === 'rare' ? 1 : 0
    const selectedAffixes = [...affixes].sort(() => Math.random() - 0.5).slice(0, numAffixes).map(a => `${a}+${5 + Math.floor(Math.random() * 20)}%`)

    const newArtifact: Artifact = {
      id: `art_${Date.now()}`,
      name: selectedRarity === 'common' || selectedRarity === 'uncommon' ? `${name}碎片` : name,
      type: 'artifact_fragment',
      rarity: selectedRarity,
      era: era,
      completeness: completeness,
      score: 0,
      description: `从${ruin.name}挖掘出的神秘物品，需要鉴定才能了解其真正价值`,
      fragments: [],
      affixes: selectedAffixes,
      image: ['🏺', '💎', '📜', '🗿', '⚱️', '🔮', '🗡️', '👑'][Math.floor(Math.random() * 8)],
      isRepaired: false,
      isIdentified: false,
      excavatedAt: Date.now()
    }

    set(state => ({
      player: {
        ...state.player,
        stamina: state.player.stamina - ruin.staminaCost,
        excavationDepth: state.player.excavationDepth + ruin.depth,
        exp: state.player.exp + ruin.difficulty * 50
      },
      artifacts: [...state.artifacts, newArtifact],
      ruinSites: state.ruinSites.map(r => r.id === ruinId ? { ...r, weather } : r)
    }))

    return {
      success: true,
      loot: newArtifact,
      message: `挖掘成功！获得了 ${newArtifact.name}（${getRarityText(selectedRarity)}）`
    }
  },

  identifyArtifact: (artifactId) => {
    const state = get()
    const artifact = state.artifacts.find(a => a.id === artifactId)
    if (!artifact || artifact.isIdentified) {
      return { success: false, score: 0, message: '无法鉴定' }
    }

    const score = calculateScore(artifact.rarity, artifact.era, artifact.completeness)

    set(state => ({
      artifacts: state.artifacts.map(a =>
        a.id === artifactId
          ? { ...a, isIdentified: true, score, type: 'repaired_artifact' as const }
          : a
      ),
      player: {
        ...state.player,
        exp: state.player.exp + 100
      }
    }))

    return {
      success: true,
      score,
      message: `鉴定成功！物品评分为 ${score} 分`
    }
  },

  repairArtifact: (artifactId, materialIds) => {
    const state = get()
    const artifact = state.artifacts.find(a => a.id === artifactId)
    if (!artifact || artifact.isRepaired || !artifact.isIdentified) {
      return { success: false, damaged: false, message: '无法修复' }
    }

    const baseSuccessRate = state.player.restorerProficiency
    const materialBonus = materialIds.length * 5
    const successRate = Math.min(95, baseSuccessRate + materialBonus)
    const roll = Math.random() * 100

    if (roll < successRate) {
      const newCompleteness = Math.min(100, artifact.completeness + 20 + Math.floor(Math.random() * 20))
      const newScore = calculateScore(artifact.rarity, artifact.era, newCompleteness)

      set(state => ({
        artifacts: state.artifacts.map(a =>
          a.id === artifactId
            ? { ...a, isRepaired: true, completeness: newCompleteness, score: newScore }
            : a
        ),
        materials: state.materials.map(m =>
          materialIds.includes(m.id)
            ? { ...m, quantity: Math.max(0, m.quantity - 1) }
            : m
        ),
        player: {
          ...state.player,
          restorerProficiency: Math.min(100, state.player.restorerProficiency + 0.5),
          totalArtifacts: state.player.totalArtifacts + 1,
          exp: state.player.exp + 200
        }
      }))

      if (artifact.rarity === 'epic' || artifact.rarity === 'legendary') {
        get().addAnnouncement('system', `🎉 恭喜「${state.player.name}」成功修复了${getRarityText(artifact.rarity)}文物「${artifact.name}」！`)
      }

      return { success: true, damaged: false, message: `修复成功！完整度提升至 ${newCompleteness}%` }
    } else {
      const damaged = Math.random() < 0.3
      if (damaged) {
        set(state => ({
          artifacts: state.artifacts.map(a =>
            a.id === artifactId
              ? { ...a, completeness: Math.max(10, a.completeness - 15) }
              : a
          ),
          materials: state.materials.map(m =>
            materialIds.includes(m.id)
              ? { ...m, quantity: Math.max(0, m.quantity - 1) }
              : m
          )
        }))
        return { success: false, damaged: true, message: '修复失败！文物受到了损伤...' }
      }

      set(state => ({
        materials: state.materials.map(m =>
          materialIds.includes(m.id)
            ? { ...m, quantity: Math.max(0, m.quantity - 1) }
            : m
        )
      }))
      return { success: false, damaged: false, message: '修复失败，材料已消耗...' }
    }
  },

  placeArtifact: (artifactId, hallId, slotId) => {
    set(state => ({
      museumHalls: state.museumHalls.map(hall =>
        hall.id === hallId
          ? {
              ...hall,
              slots: hall.slots.map(slot =>
                slot.id === slotId
                  ? { ...slot, artifactId }
                  : slot
              )
            }
          : hall
      )
    }))

    setTimeout(() => {
      const state = get()
      const totalScore = state.museumHalls.reduce((sum, hall) => {
        if (!hall.unlocked) return sum
        return sum + hall.slots.reduce((s, slot) => {
          if (!slot.artifactId) return s
          const art = state.artifacts.find(a => a.id === slot.artifactId)
          return s + (art?.score || 0)
        }, 0) * hall.ticketBonus
      }, 0)
      set(state => ({
        player: { ...state.player, museumScore: Math.floor(totalScore) }
      }))
    }, 0)
  },

  removeArtifact: (hallId, slotId) => {
    set(state => ({
      museumHalls: state.museumHalls.map(hall =>
        hall.id === hallId
          ? {
              ...hall,
              slots: hall.slots.map(slot =>
                slot.id === slotId
                  ? { ...slot, artifactId: null }
                  : slot
              )
            }
          : hall
      )
    }))
  },

  listItem: (itemId, itemType, itemName, rarity, price) => {
    const state = get()
    const avgPrice = state.marketListings
      .filter(l => l.rarity === rarity && l.itemType === itemType)
      .reduce((sum, l) => sum + l.price, 0) / Math.max(1, state.marketListings.filter(l => l.rarity === rarity && l.itemType === itemType).length)

    const suggestedMin = Math.floor(avgPrice * 0.8)
    const suggestedMax = Math.floor(avgPrice * 1.2)

    const newListing: MarketListing = {
      id: `list_${Date.now()}`,
      sellerId: state.player.id,
      sellerName: state.player.name,
      itemId,
      itemType,
      itemName,
      rarity,
      price,
      suggestedMin: suggestedMin || price * 0.8,
      suggestedMax: suggestedMax || price * 1.2,
      listedAt: Date.now()
    }

    set(state => ({
      marketListings: [...state.marketListings, newListing]
    }))
  },

  buyItem: (listingId) => {
    const state = get()
    const listing = state.marketListings.find(l => l.id === listingId)
    if (!listing) return { success: false, message: '商品不存在' }
    if (state.player.gold < listing.price) return { success: false, message: '金币不足' }

    set(state => ({
      player: { ...state.player, gold: state.player.gold - listing.price },
      marketListings: state.marketListings.filter(l => l.id !== listingId)
    }))

    get().addAnnouncement('market', `💰 「${state.player.name}」购买了「${listing.itemName}」，成交价 ${listing.price.toLocaleString()} 金币！`)

    return { success: true, message: '购买成功！' }
  },

  joinCompetition: (artifactIds) => {
    const state = get()
    const artifacts = state.artifacts.filter(a => artifactIds.includes(a.id) && a.isRepaired)
    const score = artifacts.reduce((sum, a) => sum + a.score, 0)

    set(state => ({
      competition: {
        ...state.competition,
        participants: [
          ...state.competition.participants.filter(p => p.playerId !== state.player.id),
          {
            playerId: state.player.id,
            playerName: state.player.name,
            artifactIds,
            score,
            rank: 0
          }
        ].sort((a, b) => b.score - a.score).map((p, i) => ({ ...p, rank: i + 1 }))
      }
    }))
  },

  contributeToGuild: (materialId, amount) => {
    set(state => {
      const material = state.materials.find(m => m.id === materialId)
      if (!material || material.quantity < amount) return state

      return {
        materials: state.materials.map(m =>
          m.id === materialId ? { ...m, quantity: m.quantity - amount } : m
        ),
        guild: {
          ...state.guild,
          materials: {
            ...state.guild.materials,
            [materialId]: (state.guild.materials[materialId] || 0) + amount
          },
          members: state.guild.members.map(m =>
            m.id === state.player.id ? { ...m, contribution: m.contribution + amount * 10 } : m
          )
        }
      }
    })
  },

  upgradeGuildBuilding: (buildingId) => {
    const state = get()
    const building = state.guild.buildings.find(b => b.id === buildingId)
    if (!building || building.level >= building.maxLevel) {
      return { success: false, message: '无法升级' }
    }

    if (state.guild.gold < building.upgradeCost.gold) {
      return { success: false, message: '公会金币不足' }
    }

    for (const [matId, amount] of Object.entries(building.upgradeCost.materials)) {
      if ((state.guild.materials[matId] || 0) < amount) {
        return { success: false, message: '材料不足' }
      }
    }

    set(state => {
      const newMaterials = { ...state.guild.materials }
      for (const [matId, amount] of Object.entries(building.upgradeCost.materials)) {
        newMaterials[matId] = (newMaterials[matId] || 0) - amount
      }

      return {
        guild: {
          ...state.guild,
          gold: state.guild.gold - building.upgradeCost.gold,
          materials: newMaterials,
          buildings: state.guild.buildings.map(b =>
            b.id === buildingId
              ? {
                  ...b,
                  level: b.level + 1,
                  bonus: b.type === 'excavation_site'
                    ? `全体挖掘效率+${(b.level + 1) * 5}%`
                    : b.type === 'repair_room'
                    ? `修复成功率+${(b.level + 1) * 5}%`
                    : b.type === 'library'
                    ? `鉴定准确率+${(b.level + 1) * 5}%`
                    : `材料存储上限+${(b.level + 1) * 10}%`
                }
              : b
          )
        }
      }
    })

    return { success: true, message: '建筑升级成功！' }
  },

  addAnnouncement: (type, message) => {
    set(state => ({
      announcements: [
        { id: `ann_${Date.now()}`, type, message, timestamp: Date.now() },
        ...state.announcements
      ].slice(0, 20)
    }))
  },

  updateStamina: (amount) => {
    set(state => ({
      player: {
        ...state.player,
        stamina: Math.min(state.player.maxStamina, Math.max(0, state.player.stamina + amount))
      }
    }))
  },

  updateGold: (amount) => {
    set(state => ({
      player: {
        ...state.player,
        gold: Math.max(0, state.player.gold + amount)
      }
    }))
  }
}))

function getRarityText(rarity: Rarity): string {
  const map: Record<Rarity, string> = {
    common: '普通',
    uncommon: '优秀',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  }
  return map[rarity]
}
