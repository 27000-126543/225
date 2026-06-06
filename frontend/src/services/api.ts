const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || '请求失败');
  }
  return data;
};

export const api = {
  auth: {
    register: (username: string, password: string) =>
      fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      }).then(handleResponse),

    login: (username: string, password: string) =>
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      }).then(handleResponse),

    getMe: () =>
      fetch(`${API_BASE}/auth/me`, { headers: getHeaders() }).then(handleResponse),

    recoverStamina: () =>
      fetch(`${API_BASE}/auth/stamina/recover`, {
        method: 'POST',
        headers: getHeaders()
      }).then(handleResponse)
  },

  excavation: {
    getRuins: () =>
      fetch(`${API_BASE}/excavation/ruins`, { headers: getHeaders() }).then(handleResponse),

    getWeather: () =>
      fetch(`${API_BASE}/excavation/weather`, { headers: getHeaders() }).then(handleResponse),

    excavate: (ruinId: string) =>
      fetch(`${API_BASE}/excavation/excavate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ruinId })
      }).then(handleResponse),

    getArtifacts: (status?: string) =>
      fetch(`${API_BASE}/excavation/artifacts${status ? `?status=${status}` : ''}`, {
        headers: getHeaders()
      }).then(handleResponse),

    getMaterials: () =>
      fetch(`${API_BASE}/excavation/materials`, { headers: getHeaders() }).then(handleResponse)
  },

  workshop: {
    identify: (artifactId: string) =>
      fetch(`${API_BASE}/workshop/identify`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ artifactId })
      }).then(handleResponse),

    repair: (artifactId: string, materialIds: string[]) =>
      fetch(`${API_BASE}/workshop/repair`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ artifactId, materialIds })
      }).then(handleResponse)
  },

  museum: {
    getHalls: () =>
      fetch(`${API_BASE}/museum/halls`, { headers: getHeaders() }).then(handleResponse),

    getAvailableArtifacts: () =>
      fetch(`${API_BASE}/museum/available-artifacts`, { headers: getHeaders() }).then(handleResponse),

    placeArtifact: (hallId: string, artifactId: string, position: { x: number; y: number }, size: string) =>
      fetch(`${API_BASE}/museum/place`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ hallId, artifactId, position, size })
      }).then(handleResponse),

    removeArtifact: (slotId: string) =>
      fetch(`${API_BASE}/museum/remove`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ slotId })
      }).then(handleResponse),

    getIncome: () =>
      fetch(`${API_BASE}/museum/income`, { headers: getHeaders() }).then(handleResponse)
  },

  market: {
    getListings: () =>
      fetch(`${API_BASE}/market/listings`, { headers: getHeaders() }).then(handleResponse),

    getMyListings: () =>
      fetch(`${API_BASE}/market/my-listings`, { headers: getHeaders() }).then(handleResponse),

    getPriceSuggestion: (rarity: string, type: string) =>
      fetch(`${API_BASE}/market/price-suggestion?rarity=${rarity}&type=${type}`, {
        headers: getHeaders()
      }).then(handleResponse),

    listItem: (itemId: string, itemType: string, price: number, suggestedMin: number, suggestedMax: number) =>
      fetch(`${API_BASE}/market/list`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ itemId, itemType, price, suggestedMin, suggestedMax })
      }).then(handleResponse),

    buyItem: (listingId: string) =>
      fetch(`${API_BASE}/market/buy`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ listingId })
      }).then(handleResponse),

    cancelListing: (listingId: string) =>
      fetch(`${API_BASE}/market/cancel`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ listingId })
      }).then(handleResponse)
  },

  competition: {
    getActive: () =>
      fetch(`${API_BASE}/competition/active`, { headers: getHeaders() }).then(handleResponse),

    join: (competitionId: string, artifactIds: string[]) =>
      fetch(`${API_BASE}/competition/join`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ competitionId, artifactIds })
      }).then(handleResponse),

    getRewards: () =>
      fetch(`${API_BASE}/competition/rewards`, { headers: getHeaders() }).then(handleResponse)
  },

  guild: {
    getAll: () =>
      fetch(`${API_BASE}/guild`, { headers: getHeaders() }).then(handleResponse),

    create: (name: string) =>
      fetch(`${API_BASE}/guild/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name })
      }).then(handleResponse),

    join: (guildId: string) =>
      fetch(`${API_BASE}/guild/join/${guildId}`, {
        method: 'POST',
        headers: getHeaders()
      }).then(handleResponse),

    leave: () =>
      fetch(`${API_BASE}/guild/leave`, {
        method: 'POST',
        headers: getHeaders()
      }).then(handleResponse),

    contribute: (gold?: number, materialId?: string, quantity?: number) =>
      fetch(`${API_BASE}/guild/contribute`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ gold, materialId, quantity })
      }).then(handleResponse),

    upgradeBuilding: (buildingId: string) =>
      fetch(`${API_BASE}/guild/upgrade/${buildingId}`, {
        method: 'POST',
        headers: getHeaders()
      }).then(handleResponse)
  },

  war: {
    getAll: () =>
      fetch(`${API_BASE}/war`, { headers: getHeaders() }).then(handleResponse),

    declare: (targetGuildId: string, ruinName: string) =>
      fetch(`${API_BASE}/war/declare`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ targetGuildId, ruinName })
      }).then(handleResponse),

    participate: (warId: string) =>
      fetch(`${API_BASE}/war/participate/${warId}`, {
        method: 'POST',
        headers: getHeaders()
      }).then(handleResponse)
  },

  leaderboard: {
    getMuseum: () =>
      fetch(`${API_BASE}/leaderboard/museum`, { headers: getHeaders() }).then(handleResponse),

    getArtifacts: () =>
      fetch(`${API_BASE}/leaderboard/artifacts`, { headers: getHeaders() }).then(handleResponse),

    getExcavation: () =>
      fetch(`${API_BASE}/leaderboard/excavation`, { headers: getHeaders() }).then(handleResponse),

    getRepair: () =>
      fetch(`${API_BASE}/leaderboard/repair`, { headers: getHeaders() }).then(handleResponse),

    getReport: (userId: string) =>
      fetch(`${API_BASE}/leaderboard/report/${userId}`, { headers: getHeaders() }).then(handleResponse)
  },

  announcements: {
    getAll: () =>
      fetch(`${API_BASE}/announcements`, { headers: getHeaders() }).then(handleResponse)
  }
};
