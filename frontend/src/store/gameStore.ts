import { create } from 'zustand';
import { api } from '../services/api';

export interface User {
  id: string;
  username: string;
  level: number;
  exp: number;
  stamina: number;
  maxStamina: number;
  gold: number;
  gems: number;
  restorerProficiency: number;
  museumScore: number;
  totalArtifacts: number;
  excavationDepth: number;
  repairSuccessRate: number;
  teamName: string;
  toolQuality: string;
}

export interface Artifact {
  id: string;
  userId: string;
  name: string;
  type: string;
  rarity: string;
  era: string;
  completeness: number;
  score: number;
  description: string;
  affixes: string[];
  image: string;
  isRepaired: number;
  isIdentified: number;
  excavatedAt: string;
}

export interface Material {
  id: string;
  userId: string;
  name: string;
  rarity: string;
  quantity: number;
  description: string;
}

export interface RuinSite {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  minLevel: number;
  staminaCost: number;
  era: string;
  depth: number;
}

export interface MuseumHall {
  id: string;
  userId: string;
  name: string;
  theme: string;
  unlocked: number;
  ticketBonus: number;
  items: Array<{
    slotId: string;
    artifact: Artifact;
    position: { x: number; y: number };
    size: string;
  }>;
}

export interface MarketListing {
  id: string;
  sellerId: string;
  sellerName: string;
  itemType: string;
  itemName: string;
  rarity: string;
  price: number;
  suggestedMin: number;
  suggestedMax: number;
  listedAt: string;
}

export interface Guild {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  level: number;
  exp: number;
  gold: number;
  reputation: number;
  members: GuildMember[];
  buildings: GuildBuilding[];
  materials: any[];
  myRole?: string;
}

export interface GuildMember {
  id: string;
  guildId: string;
  userId: string;
  userName: string;
  role: string;
  contribution: number;
  joinedAt: string;
}

export interface GuildBuilding {
  id: string;
  guildId: string;
  name: string;
  type: string;
  level: number;
  maxLevel: number;
  bonus: string;
  upgradeCost: string;
}

export interface RuinWar {
  id: string;
  ruinName: string;
  guildAId: string;
  guildAName: string;
  guildBId: string;
  guildBName: string;
  status: string;
  startTime: string;
  endTime?: string;
  winnerId?: string;
  scoreA: number;
  scoreB: number;
}

export interface Announcement {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

interface GameState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  artifacts: Artifact[];
  materials: Material[];
  ruinSites: RuinSite[];
  museumHalls: MuseumHall[];
  marketListings: MarketListing[];
  myListings: MarketListing[];
  guilds: Guild[];
  myGuild: Guild | null;
  wars: RuinWar[];
  announcements: Announcement[];
  leaderboard: {
    museum: any[];
    artifacts: any[];
    excavation: any[];
    repair: any[];
  };
  weather: string;
  activeView: string;
  notification: { message: string; type: string } | null;

  setActiveView: (view: string) => void;
  setNotification: (msg: string, type: string) => void;
  clearNotification: () => void;

  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUserData: () => Promise<void>;
  recoverStamina: () => Promise<void>;

  fetchRuins: () => Promise<void>;
  fetchWeather: () => Promise<void>;
  excavate: (ruinId: string) => Promise<any>;
  fetchArtifacts: (status?: string) => Promise<void>;
  fetchMaterials: () => Promise<void>;

  identifyArtifact: (artifactId: string) => Promise<any>;
  repairArtifact: (artifactId: string, materialIds: string[]) => Promise<any>;

  fetchMuseumHalls: () => Promise<void>;
  placeArtifact: (hallId: string, artifactId: string, position: { x: number; y: number }, size: string) => Promise<void>;
  removeArtifact: (slotId: string) => Promise<void>;

  fetchMarketListings: () => Promise<void>;
  fetchMyListings: () => Promise<void>;
  getPriceSuggestion: (rarity: string, type: string) => Promise<any>;
  listItem: (itemId: string, itemType: string, price: number, suggestedMin: number, suggestedMax: number) => Promise<void>;
  buyItem: (listingId: string) => Promise<void>;
  cancelListing: (listingId: string) => Promise<void>;

  fetchGuilds: () => Promise<void>;
  createGuild: (name: string) => Promise<void>;
  joinGuild: (guildId: string) => Promise<void>;
  leaveGuild: () => Promise<void>;
  contributeToGuild: (gold?: number, materialId?: string, quantity?: number) => Promise<void>;
  upgradeBuilding: (buildingId: string) => Promise<void>;

  fetchWars: () => Promise<void>;
  declareWar: (targetGuildId: string, ruinName: string) => Promise<void>;
  participateWar: (warId: string) => Promise<any>;

  fetchLeaderboard: () => Promise<void>;
  fetchReport: (userId: string) => Promise<any>;

  fetchAnnouncements: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  artifacts: [],
  materials: [],
  ruinSites: [],
  museumHalls: [],
  marketListings: [],
  myListings: [],
  guilds: [],
  myGuild: null,
  wars: [],
  announcements: [],
  leaderboard: { museum: [], artifacts: [], excavation: [], repair: [] },
  weather: 'sunny',
  activeView: 'excavation',
  notification: null,

  setActiveView: (view) => set({ activeView: view }),
  setNotification: (message, type) => {
    set({ notification: { message, type } });
    setTimeout(() => set({ notification: null }), 3000);
  },
  clearNotification: () => set({ notification: null }),

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const data = await api.auth.login(username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (username, password) => {
    set({ isLoading: true });
    try {
      const data = await api.auth.register(username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  fetchUserData: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const user = await api.auth.getMe();
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  recoverStamina: async () => {
    try {
      const data = await api.auth.recoverStamina();
      set((state) => state.user ? { user: { ...state.user, stamina: data.stamina } } : {});
      get().setNotification(`恢复了 ${data.recovered} 点体力！`, 'success');
    } catch (e: any) {
      get().setNotification(e.message, 'error');
    }
  },

  fetchRuins: async () => {
    try {
      const ruins = await api.excavation.getRuins();
      set({ ruinSites: ruins });
    } catch (e: any) {
      get().setNotification(e.message, 'error');
    }
  },

  fetchWeather: async () => {
    try {
      const data = await api.excavation.getWeather();
      set({ weather: data.weather });
    } catch {}
  },

  excavate: async (ruinId) => {
    set({ isLoading: true });
    try {
      const result = await api.excavation.excavate(ruinId);
      set((state) => ({
        user: result.user,
        weather: result.weather,
        artifacts: [...result.artifacts, ...state.artifacts]
      }));
      get().setNotification(`挖掘成功！获得 ${result.artifacts.length} 件物品`, 'success');
      return result;
    } catch (e: any) {
      get().setNotification(e.message, 'error');
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchArtifacts: async (status) => {
    try {
      const artifacts = await api.excavation.getArtifacts(status);
      set({ artifacts });
    } catch {}
  },

  fetchMaterials: async () => {
    try {
      const materials = await api.excavation.getMaterials();
      set({ materials });
    } catch {}
  },

  identifyArtifact: async (artifactId) => {
    set({ isLoading: true });
    try {
      const result = await api.workshop.identify(artifactId);
      set((state) => ({
        artifacts: state.artifacts.map(a =>
          a.id === artifactId ? result.artifact : a
        )
      }));
      get().setNotification(`鉴定完成！评分: ${result.score}`, 'success');
      return result;
    } catch (e: any) {
      get().setNotification(e.message, 'error');
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  repairArtifact: async (artifactId, materialIds) => {
    set({ isLoading: true });
    try {
      const result = await api.workshop.repair(artifactId, materialIds);
      set((state) => {
        const updatedArtifacts = state.artifacts.map(a =>
          a.id === artifactId ? result.artifact : a
        );
        const updatedUser = state.user ? {
          ...state.user,
          restorerProficiency: result.newProficiency
        } : null;
        return { artifacts: updatedArtifacts, user: updatedUser };
      });
      get().setNotification(
        result.success ? `修复成功！熟练度 +${result.proficiencyGain}` : '修复失败...文物受损',
        result.success ? 'success' : 'error'
      );
      return result;
    } catch (e: any) {
      get().setNotification(e.message, 'error');
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMuseumHalls: async () => {
    try {
      const halls = await api.museum.getHalls();
      set({ museumHalls: halls });
    } catch {}
  },

  placeArtifact: async (hallId, artifactId, position, size) => {
    try {
      await api.museum.placeArtifact(hallId, artifactId, position, size);
      await get().fetchMuseumHalls();
      get().setNotification('文物已放置！', 'success');
    } catch (e: any) {
      get().setNotification(e.message, 'error');
    }
  },

  removeArtifact: async (slotId) => {
    try {
      await api.museum.removeArtifact(slotId);
      await get().fetchMuseumHalls();
      get().setNotification('文物已移除', 'success');
    } catch (e: any) {
      get().setNotification(e.message, 'error');
    }
  },

  fetchMarketListings: async () => {
    try {
      const listings = await api.market.getListings();
      set({ marketListings: listings });
    } catch {}
  },

  fetchMyListings: async () => {
    try {
      const listings = await api.market.getMyListings();
      set({ myListings: listings });
    } catch {}
  },

  getPriceSuggestion: async (rarity, type) => {
    return await api.market.getPriceSuggestion(rarity, type);
  },

  listItem: async (itemId, itemType, price, suggestedMin, suggestedMax) => {
    try {
      await api.market.listItem(itemId, itemType, price, suggestedMin, suggestedMax);
      await get().fetchMyListings();
      await get().fetchArtifacts();
      await get().fetchMaterials();
      get().setNotification('商品已上架！', 'success');
    } catch (e: any) {
      get().setNotification(e.message, 'error');
    }
  },

  buyItem: async (listingId) => {
    try {
      await api.market.buyItem(listingId);
      await get().fetchMarketListings();
      await get().fetchUserData();
      await get().fetchArtifacts();
      await get().fetchMaterials();
      await get().fetchAnnouncements();
      get().setNotification('购买成功！', 'success');
    } catch (e: any) {
      get().setNotification(e.message, 'error');
    }
  },

  cancelListing: async (listingId) => {
    try {
      await api.market.cancelListing(listingId);
      await get().fetchMyListings();
      await get().fetchArtifacts();
      await get().fetchMaterials();
      get().setNotification('商品已下架', 'success');
    } catch (e: any) {
      get().setNotification(e.message, 'error');
    }
  },

  fetchGuilds: async () => {
    try {
      const data = await api.guild.getAll();
      set({ guilds: data.guilds, myGuild: data.myGuild });
    } catch {}
  },

  createGuild: async (name) => {
    try {
      await api.guild.create(name);
      await get().fetchGuilds();
      get().setNotification('公会创建成功！', 'success');
    } catch (e: any) {
      get().setNotification(e.message, 'error');
    }
  },

  joinGuild: async (guildId) => {
    try {
      await api.guild.join(guildId);
      await get().fetchGuilds();
      get().setNotification('加入公会成功！', 'success');
    } catch (e: any) {
      get().setNotification(e.message, 'error');
    }
  },

  leaveGuild: async () => {
    try {
      await api.guild.leave();
      await get().fetchGuilds();
      get().setNotification('已退出公会', 'success');
    } catch (e: any) {
      get().setNotification(e.message, 'error');
    }
  },

  contributeToGuild: async (gold, materialId, quantity) => {
    try {
      const result = await api.guild.contribute(gold, materialId, quantity);
      await get().fetchGuilds();
      await get().fetchUserData();
      await get().fetchMaterials();
      get().setNotification(`贡献成功！+${result.contribution} 贡献值`, 'success');
    } catch (e: any) {
      get().setNotification(e.message, 'error');
    }
  },

  upgradeBuilding: async (buildingId) => {
    try {
      await api.guild.upgradeBuilding(buildingId);
      await get().fetchGuilds();
      get().setNotification('建筑升级成功！', 'success');
    } catch (e: any) {
      get().setNotification(e.message, 'error');
    }
  },

  fetchWars: async () => {
    try {
      const wars = await api.war.getAll();
      set({ wars });
    } catch {}
  },

  declareWar: async (targetGuildId, ruinName) => {
    try {
      await api.war.declare(targetGuildId, ruinName);
      await get().fetchWars();
      await get().fetchAnnouncements();
      get().setNotification('争夺战已发起！', 'success');
    } catch (e: any) {
      get().setNotification(e.message, 'error');
    }
  },

  participateWar: async (warId) => {
    try {
      const result = await api.war.participate(warId);
      await get().fetchWars();
      await get().fetchAnnouncements();
      get().setNotification(`参战成功！获得 ${result.score} 分`, 'success');
      return result;
    } catch (e: any) {
      get().setNotification(e.message, 'error');
      throw e;
    }
  },

  fetchLeaderboard: async () => {
    try {
      const [museum, artifacts, excavation, repair] = await Promise.all([
        api.leaderboard.getMuseum(),
        api.leaderboard.getArtifacts(),
        api.leaderboard.getExcavation(),
        api.leaderboard.getRepair()
      ]);
      set({ leaderboard: { museum, artifacts, excavation, repair } });
    } catch {}
  },

  fetchReport: async (userId) => {
    return await api.leaderboard.getReport(userId);
  },

  fetchAnnouncements: async () => {
    try {
      const announcements = await api.announcements.getAll();
      set({ announcements });
    } catch {}
  }
}));
