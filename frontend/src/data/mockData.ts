import {
  Player, Artifact, RuinSite, ArchaeologyTeam, TeamMember,
  RepairMaterial, MuseumHall, MarketListing, Competition,
  Guild, Announcement, Scroll, Gem, GuildBuilding, LeaderboardEntry
} from '../types'

export const mockPlayer: Player = {
  id: 'player1',
  name: '考古大师·艾伦',
  level: 25,
  exp: 12500,
  stamina: 85,
  maxStamina: 100,
  gold: 156800,
  gems: 250,
  restorerProficiency: 78,
  museumScore: 8950,
  totalArtifacts: 42,
  excavationDepth: 156,
  repairSuccessRate: 82
}

export const mockArtifacts: Artifact[] = [
  {
    id: 'art1',
    name: '龙晶权杖',
    type: 'repaired_artifact',
    rarity: 'legendary',
    era: 'ancient',
    completeness: 95,
    score: 1250,
    description: '传说中由第一代龙祭司打造的权杖，蕴含强大的魔力',
    fragments: ['frag1', 'frag2', 'frag3'],
    affixes: ['魔力增幅+20%', '考古效率+15%', '龙语亲和'],
    image: '🗡️',
    isRepaired: true,
    isIdentified: true,
    excavatedAt: Date.now() - 86400000 * 5
  },
  {
    id: 'art2',
    name: '月光宝盒',
    type: 'repaired_artifact',
    rarity: 'epic',
    era: 'medieval',
    completeness: 88,
    score: 890,
    description: '魔法师梅林制作的神秘宝盒，据说能储存月光能量',
    fragments: ['frag4', 'frag5'],
    affixes: ['修复成功率+10%', '月光祝福'],
    image: '📦',
    isRepaired: true,
    isIdentified: true,
    excavatedAt: Date.now() - 86400000 * 3
  },
  {
    id: 'art3',
    name: '太阳神殿石碑',
    type: 'repaired_artifact',
    rarity: 'rare',
    era: 'classical',
    completeness: 75,
    score: 560,
    description: '刻有古老太阳符文的石碑碎片',
    fragments: ['frag6'],
    affixes: ['阳光抗性'],
    image: '🪨',
    isRepaired: true,
    isIdentified: true,
    excavatedAt: Date.now() - 86400000 * 1
  },
  {
    id: 'art4',
    name: '未知符文碎片',
    type: 'artifact_fragment',
    rarity: 'epic',
    era: 'ancient',
    completeness: 30,
    score: 0,
    description: '尚未鉴定的神秘符文碎片',
    fragments: [],
    affixes: [],
    image: '🔮',
    isRepaired: false,
    isIdentified: false,
    excavatedAt: Date.now() - 3600000
  },
  {
    id: 'art5',
    name: '青铜护符残片',
    type: 'artifact_fragment',
    rarity: 'uncommon',
    era: 'renaissance',
    completeness: 45,
    score: 0,
    description: '古老炼金术师的护符碎片',
    fragments: [],
    affixes: [],
    image: '🔱',
    isRepaired: false,
    isIdentified: true,
    excavatedAt: Date.now() - 7200000
  }
]

export const mockScrolls: Scroll[] = [
  {
    id: 'scroll1',
    name: '古代挖掘术',
    rarity: 'rare',
    era: 'classical',
    content: '记载了失传的遗迹探测技术',
    knowledgeBonus: 15
  },
  {
    id: 'scroll2',
    name: '修复密典',
    rarity: 'epic',
    era: 'medieval',
    content: '大师级文物修复技巧详解',
    knowledgeBonus: 25
  }
]

export const mockGems: Gem[] = [
  {
    id: 'gem1',
    name: '灵魂红宝石',
    rarity: 'epic',
    color: '#ef4444',
    power: 80,
    forRepair: ['legendary', 'epic']
  },
  {
    id: 'gem2',
    name: '智慧蓝宝石',
    rarity: 'rare',
    color: '#3b82f6',
    power: 50,
    forRepair: ['rare', 'epic']
  }
]

export const mockRuinSites: RuinSite[] = [
  {
    id: 'ruin1',
    name: '遗忘神殿',
    description: '传说中供奉古神的神秘神殿，隐藏着无数宝藏',
    difficulty: 3,
    minLevel: 1,
    staminaCost: 15,
    possibleDrops: ['artifact_fragment', 'scroll', 'gem'],
    era: 'ancient',
    weather: 'magical',
    depth: 50,
    unlocked: true
  },
  {
    id: 'ruin2',
    name: '龙巢废墟',
    description: '古龙栖息的巢穴，危险但回报丰厚',
    difficulty: 5,
    minLevel: 10,
    staminaCost: 25,
    possibleDrops: ['artifact_fragment', 'gem'],
    era: 'classical',
    weather: 'stormy',
    depth: 120,
    unlocked: true
  },
  {
    id: 'ruin3',
    name: '精灵森林遗迹',
    description: '古老精灵文明的失落之城',
    difficulty: 4,
    minLevel: 15,
    staminaCost: 20,
    possibleDrops: ['artifact_fragment', 'scroll'],
    era: 'medieval',
    weather: 'sunny',
    depth: 80,
    unlocked: true
  },
  {
    id: 'ruin4',
    name: '冰封王座',
    description: '被冰雪封印的古代王国',
    difficulty: 7,
    minLevel: 25,
    staminaCost: 35,
    possibleDrops: ['artifact_fragment', 'gem', 'scroll'],
    era: 'renaissance',
    weather: 'stormy',
    depth: 200,
    unlocked: false
  },
  {
    id: 'ruin5',
    name: '深渊地牢',
    description: '连接地底世界的神秘入口',
    difficulty: 9,
    minLevel: 35,
    staminaCost: 50,
    possibleDrops: ['artifact_fragment', 'gem'],
    era: 'ancient',
    weather: 'magical',
    depth: 500,
    unlocked: false
  }
]

const mockTeamMembers: TeamMember[] = [
  { id: 'm1', name: '艾伦', role: 'leader', skill: 90, stamina: 100 },
  { id: 'm2', name: '矿工老布', role: 'digger', skill: 75, stamina: 85 },
  { id: 'm3', name: '侦察兵莉娜', role: 'scout', skill: 82, stamina: 90 },
  { id: 'm4', name: '修复师卡尔', role: 'restorer', skill: 88, stamina: 80 }
]

export const mockTeam: ArchaeologyTeam = {
  id: 'team1',
  name: '探险者联盟',
  members: mockTeamMembers,
  toolQuality: 'excellent',
  activeRuin: null,
  excavationProgress: 0
}

export const mockMaterials: RepairMaterial[] = [
  { id: 'mat1', name: '魔力粘合剂', rarity: 'rare', quantity: 15, description: '用于修复文物裂缝的神奇粘合剂' },
  { id: 'mat2', name: '古代青铜粉', rarity: 'uncommon', quantity: 32, description: '精炼的古代青铜粉末' },
  { id: 'mat3', name: '精灵丝线', rarity: 'epic', quantity: 8, description: '精灵工匠的珍贵材料' },
  { id: 'mat4', name: '龙鳞碎片', rarity: 'legendary', quantity: 2, description: '古龙鳞片的碎片，蕴含强大魔力' },
  { id: 'mat5', name: '净化水晶', rarity: 'common', quantity: 58, description: '用于净化文物的普通水晶' }
]

export const mockMuseumHalls: MuseumHall[] = [
  {
    id: 'hall1',
    name: '远古文明厅',
    theme: 'ancient',
    unlocked: true,
    ticketBonus: 1.2,
    slots: [
      { id: 's1', artifactId: 'art1', position: { x: 1, y: 1 }, size: 'large' },
      { id: 's2', artifactId: null, position: { x: 2, y: 1 }, size: 'medium' },
      { id: 's3', artifactId: null, position: { x: 3, y: 1 }, size: 'medium' },
      { id: 's4', artifactId: 'art3', position: { x: 1, y: 2 }, size: 'small' },
      { id: 's5', artifactId: null, position: { x: 2, y: 2 }, size: 'small' },
      { id: 's6', artifactId: null, position: { x: 3, y: 2 }, size: 'small' }
    ]
  },
  {
    id: 'hall2',
    name: '中世纪魔法厅',
    theme: 'medieval',
    unlocked: true,
    ticketBonus: 1.0,
    slots: [
      { id: 's7', artifactId: 'art2', position: { x: 1, y: 1 }, size: 'large' },
      { id: 's8', artifactId: null, position: { x: 2, y: 1 }, size: 'medium' },
      { id: 's9', artifactId: null, position: { x: 1, y: 2 }, size: 'small' },
      { id: 's10', artifactId: null, position: { x: 2, y: 2 }, size: 'small' }
    ]
  },
  {
    id: 'hall3',
    name: '文艺复兴厅',
    theme: 'renaissance',
    unlocked: false,
    ticketBonus: 1.5,
    slots: [
      { id: 's11', artifactId: null, position: { x: 1, y: 1 }, size: 'large' },
      { id: 's12', artifactId: null, position: { x: 2, y: 1 }, size: 'large' },
      { id: 's13', artifactId: null, position: { x: 1, y: 2 }, size: 'medium' },
      { id: 's14', artifactId: null, position: { x: 2, y: 2 }, size: 'medium' }
    ]
  }
]

export const mockMarketListings: MarketListing[] = [
  {
    id: 'list1',
    sellerId: 'p2',
    sellerName: '收藏家杰克',
    itemId: 'gem_rare_1',
    itemType: 'gem',
    itemName: '火焰红宝石',
    rarity: 'rare',
    price: 5000,
    suggestedMin: 4200,
    suggestedMax: 5800,
    listedAt: Date.now() - 3600000
  },
  {
    id: 'list2',
    sellerId: 'p3',
    sellerName: '考古新手',
    itemId: 'frag_common_1',
    itemType: 'fragment',
    itemName: '陶碗碎片',
    rarity: 'common',
    price: 200,
    suggestedMin: 150,
    suggestedMax: 300,
    listedAt: Date.now() - 7200000
  },
  {
    id: 'list3',
    sellerId: 'p4',
    sellerName: '大师修复师',
    itemId: 'mat_epic_1',
    itemType: 'material',
    itemName: '凤凰羽毛',
    rarity: 'epic',
    price: 15000,
    suggestedMin: 12000,
    suggestedMax: 18000,
    listedAt: Date.now() - 1800000
  }
]

export const mockCompetition: Competition = {
  id: 'comp1',
  name: '第一届全服考古大赛',
  season: 1,
  startDate: Date.now() - 86400000 * 2,
  endDate: Date.now() + 86400000 * 5,
  isActive: true,
  participants: [
    { playerId: 'p10', playerName: '古墓丽影', artifactIds: ['a1', 'a2', 'a3'], score: 3200, rank: 1 },
    { playerId: 'p11', playerName: '探险王', artifactIds: ['a4', 'a5'], score: 2850, rank: 2 },
    { playerId: 'p12', playerName: '文物猎人', artifactIds: ['a6', 'a7', 'a8'], score: 2600, rank: 3 },
    { playerId: 'player1', playerName: '考古大师·艾伦', artifactIds: ['art1', 'art2'], score: 2140, rank: 8 }
  ],
  rewards: [
    { rank: 1, tool: '神话级洛阳铲', toolQuality: 'legendary', gold: 100000 },
    { rank: 2, tool: '大师级探测器', toolQuality: 'masterwork', gold: 50000 },
    { rank: 3, tool: '精良挖掘套装', toolQuality: 'excellent', gold: 25000 }
  ]
}

const mockGuildBuildings: GuildBuilding[] = [
  {
    id: 'gb1',
    name: '联合挖掘场',
    type: 'excavation_site',
    level: 3,
    maxLevel: 10,
    bonus: '全体挖掘效率+15%',
    upgradeCost: { gold: 50000, materials: { 'mat1': 20, 'mat2': 50 } }
  },
  {
    id: 'gb2',
    name: '大师修复室',
    type: 'repair_room',
    level: 2,
    maxLevel: 10,
    bonus: '修复成功率+10%',
    upgradeCost: { gold: 35000, materials: { 'mat3': 10, 'mat5': 30 } }
  },
  {
    id: 'gb3',
    name: '考古图书馆',
    type: 'library',
    level: 1,
    maxLevel: 10,
    bonus: '鉴定准确率+5%',
    upgradeCost: { gold: 20000, materials: { 'mat2': 25 } }
  },
  {
    id: 'gb4',
    name: '物资仓库',
    type: 'warehouse',
    level: 4,
    maxLevel: 10,
    bonus: '材料存储上限+40%',
    upgradeCost: { gold: 40000, materials: { 'mat1': 15, 'mat5': 40 } }
  }
]

export const mockGuild: Guild = {
  id: 'guild1',
  name: '远古探秘者公会',
  leaderId: 'player1',
  leaderName: '考古大师·艾伦',
  viceLeaders: ['p20', 'p21'],
  level: 5,
  exp: 45000,
  gold: 125000,
  reputation: 8500,
  materials: { 'mat1': 120, 'mat2': 250, 'mat3': 45, 'mat4': 8, 'mat5': 300 },
  members: [
    { id: 'player1', name: '考古大师·艾伦', role: 'leader', contribution: 15000, joinedAt: Date.now() - 86400000 * 30 },
    { id: 'p20', name: '挖掘专家鲍勃', role: 'vice', contribution: 8500, joinedAt: Date.now() - 86400000 * 25 },
    { id: 'p21', name: '修复师艾米', role: 'vice', contribution: 7200, joinedAt: Date.now() - 86400000 * 20 },
    { id: 'p22', name: '新手查理', role: 'member', contribution: 1200, joinedAt: Date.now() - 86400000 * 5 },
    { id: 'p23', name: '收藏家戴安娜', role: 'member', contribution: 3500, joinedAt: Date.now() - 86400000 * 12 }
  ],
  buildings: mockGuildBuildings
}

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann1',
    type: 'market',
    message: '🎉 恭喜玩家「土豪收藏家」以 58,000 金币成交了「传说级龙晶碎片」！',
    timestamp: Date.now() - 600000
  },
  {
    id: 'ann2',
    type: 'system',
    message: '📢 第一届全服考古大赛正在火热进行中，快来参与赢取限定工具！',
    timestamp: Date.now() - 1800000
  },
  {
    id: 'ann3',
    type: 'war',
    message: '⚔️ 「远古探秘者公会」在「龙巢废墟」争夺战中击败了「黄金猎人公会」！',
    timestamp: Date.now() - 3600000
  }
]

export const mockLeaderboards = {
  museum: [
    { playerId: 'p100', playerName: '博物馆馆长', value: 25600, rank: 1 },
    { playerId: 'p101', playerName: '文物大亨', value: 21400, rank: 2 },
    { playerId: 'player1', playerName: '考古大师·艾伦', value: 8950, rank: 15 }
  ] as LeaderboardEntry[],
  artifacts: [
    { playerId: 'p102', playerName: '收藏狂人', value: 156, rank: 1 },
    { playerId: 'p103', playerName: '考古狂人', value: 128, rank: 2 },
    { playerId: 'player1', playerName: '考古大师·艾伦', value: 42, rank: 35 }
  ] as LeaderboardEntry[],
  depth: [
    { playerId: 'p104', playerName: '地底探险家', value: 580, rank: 1 },
    { playerId: 'p105', playerName: '深渊行者', value: 512, rank: 2 },
    { playerId: 'player1', playerName: '考古大师·艾伦', value: 156, rank: 42 }
  ] as LeaderboardEntry[],
  repair: [
    { playerId: 'p106', playerName: '修复之神', value: 98, rank: 1 },
    { playerId: 'p107', playerName: '圣手工匠', value: 95, rank: 2 },
    { playerId: 'player1', playerName: '考古大师·艾伦', value: 82, rank: 28 }
  ] as LeaderboardEntry[]
}
