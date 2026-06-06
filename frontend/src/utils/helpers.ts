export const getRarityText = (rarity: string) => {
  const map: Record<string, string> = {
    common: '普通',
    uncommon: '优秀',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  };
  return map[rarity] || rarity;
};

export const getRarityColor = (rarity: string) => {
  const map: Record<string, string> = {
    common: 'text-gray-400',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-amber-400'
  };
  return map[rarity] || 'text-gray-400';
};

export const getRarityBg = (rarity: string) => {
  const map: Record<string, string> = {
    common: 'bg-gray-500/20 border-gray-500/50',
    uncommon: 'bg-green-500/20 border-green-500/50',
    rare: 'bg-blue-500/20 border-blue-500/50',
    epic: 'bg-purple-500/20 border-purple-500/50',
    legendary: 'bg-amber-500/20 border-amber-500/50'
  };
  return map[rarity] || 'bg-gray-500/20 border-gray-500/50';
};

export const getEraText = (era: string) => {
  const map: Record<string, string> = {
    ancient: '远古时代',
    classical: '古典时代',
    medieval: '中世纪',
    renaissance: '文艺复兴',
    modern: '近代'
  };
  return map[era] || era;
};

export const getWeatherText = (weather: string) => {
  const map: Record<string, string> = {
    sunny: '☀️ 晴朗',
    cloudy: '☁️ 多云',
    rainy: '🌧️ 雨天',
    stormy: '⛈️ 暴风雨',
    magical: '✨ 魔法天气'
  };
  return map[weather] || weather;
};

export const getToolQualityText = (quality: string) => {
  const map: Record<string, string> = {
    basic: '基础',
    good: '良好',
    excellent: '优秀',
    masterwork: '大师',
    legendary: '传说'
  };
  return map[quality] || quality;
};

export const formatNumber = (num: number) => {
  return Number(num).toLocaleString();
};

export const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleString('zh-CN');
};
