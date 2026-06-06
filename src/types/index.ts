export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type Era = 'ancient' | 'classical' | 'medieval' | 'renaissance' | 'modern'
export type ItemType = 'artifact_fragment' | 'scroll' | 'gem' | 'repaired_artifact'
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'magical'
export type ToolQuality = 'basic' | 'good' | 'excellent' | 'masterwork' | 'legendary'

export interface Player {
  id: string
  name: string
  level: number
  exp: number
  stamina: number
  maxStamina: number
  gold: number
  gems: number
  restorerProficiency: number
  museumScore: number
  totalArtifacts: number
  excavationDepth: number
  repairSuccessRate: number
}

export interface Artifact {
  id: string
  name: string
  type: ItemType
  rarity: Rarity
  era: Era
  completeness: number
  score: number
  description: string
  fragments: string[]
  affixes: string[]
  image: string
  isRepaired: boolean
  isIdentified: boolean
  excavatedAt: number
}

export interface ArtifactFragment {
  id: string
  name: string
  rarity: Rarity
  era: Era
  artifactId: string
  description: string
}

export interface Scroll {
  id: string
  name: string
  rarity: Rarity
  era: Era
  content: string
  knowledgeBonus: number
}

export interface Gem {
  id: string
  name: string
  rarity: Rarity
  color: string
  power: number
  forRepair: string[]
}

export interface RuinSite {
  id: string
  name: string
  description: string
  difficulty: number
  minLevel: number
  staminaCost: number
  possibleDrops: string[]
  era: Era
  weather: Weather
  depth: number
  unlocked: boolean
}

export interface ArchaeologyTeam {
  id: string
  name: string
  members: TeamMember[]
  toolQuality: ToolQuality
  activeRuin: string | null
  excavationProgress: number
}

export interface TeamMember {
  id: string
  name: string
  role: 'leader' | 'digger' | 'scout' | 'restorer'
  skill: number
  stamina: number
}

export interface RepairMaterial {
  id: string
  name: string
  rarity: Rarity
  quantity: number
  description: string
}

export interface MuseumHall {
  id: string
  name: string
  theme: string
  slots: MuseumSlot[]
  unlocked: boolean
  ticketBonus: number
}

export interface MuseumSlot {
  id: string
  artifactId: string | null
  position: { x: number; y: number }
  size: 'small' | 'medium' | 'large'
}

export interface MarketListing {
  id: string
  sellerId: string
  sellerName: string
  itemId: string
  itemType: string
  itemName: string
  rarity: Rarity
  price: number
  suggestedMin: number
  suggestedMax: number
  listedAt: number
}

export interface Competition {
  id: string
  name: string
  season: number
  startDate: number
  endDate: number
  participants: CompetitionEntry[]
  rewards: CompetitionReward[]
  isActive: boolean
}

export interface CompetitionEntry {
  playerId: string
  playerName: string
  artifactIds: string[]
  score: number
  rank: number
}

export interface CompetitionReward {
  rank: number
  tool: string
  toolQuality: ToolQuality
  gold: number
}

export interface Guild {
  id: string
  name: string
  leaderId: string
  leaderName: string
  viceLeaders: string[]
  members: GuildMember[]
  level: number
  exp: number
  gold: number
  materials: { [key: string]: number }
  buildings: GuildBuilding[]
  reputation: number
}

export interface GuildMember {
  id: string
  name: string
  role: 'leader' | 'vice' | 'member'
  contribution: number
  joinedAt: number
}

export interface GuildBuilding {
  id: string
  name: string
  type: 'excavation_site' | 'repair_room' | 'library' | 'warehouse'
  level: number
  maxLevel: number
  bonus: string
  upgradeCost: { gold: number; materials: { [key: string]: number } }
}

export interface RuinWar {
  id: string
  ruinId: string
  guildA: string
  guildB: string
  startTime: number
  endTime: number
  isActive: boolean
  teamA: WarParticipant[]
  teamB: WarParticipant[]
  winner: string | null
}

export interface WarParticipant {
  playerId: string
  playerName: string
  itemsFound: number
  totalQuality: number
  timeSpent: number
}

export interface LeaderboardEntry {
  playerId: string
  playerName: string
  value: number
  rank: number
}

export interface Announcement {
  id: string
  type: 'market' | 'competition' | 'war' | 'system'
  message: string
  timestamp: number
}

export interface ChartData {
  labels: string[]
  data: number[]
}

export interface PDFReport {
  playerName: string
  generatedAt: number
  museumScore: number
  artifactDistribution: { era: string; count: number }[]
  excavationTrend: { date: string; count: number }[]
  rarityDistribution: { rarity: string; count: number }[]
}
