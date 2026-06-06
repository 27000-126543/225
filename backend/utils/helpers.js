import { v4 as uuidv4 } from 'uuid';

export const generateId = () => uuidv4();

export const calculateScore = (rarity, era, completeness) => {
  const rarityMultiplier = {
    common: 1, uncommon: 2, rare: 5, epic: 15, legendary: 50
  };
  const eraMultiplier = {
    ancient: 2.0, classical: 1.5, medieval: 1.2, renaissance: 1.0, modern: 0.8
  };
  return Math.floor(100 * (rarityMultiplier[rarity] || 1) * (eraMultiplier[era] || 1) * (completeness / 100));
};

export const calculateDropRate = (weather, toolQuality, rarity) => {
  const weatherBonus = { sunny: 1.0, cloudy: 1.1, rainy: 0.9, stormy: 0.7, magical: 1.5 };
  const toolBonus = { basic: 1.0, good: 1.2, excellent: 1.5, masterwork: 2.0, legendary: 3.0 };
  const baseRate = { common: 0.5, uncommon: 0.3, rare: 0.12, epic: 0.05, legendary: 0.01 };
  return (baseRate[rarity] || 0.1) * (weatherBonus[weather] || 1) * (toolBonus[toolQuality] || 1);
};

export const getRarityText = (rarity) => {
  const map = { common: '普通', uncommon: '优秀', rare: '稀有', epic: '史诗', legendary: '传说' };
  return map[rarity] || rarity;
};

export const getEraText = (era) => {
  const map = { ancient: '远古时代', classical: '古典时代', medieval: '中世纪', renaissance: '文艺复兴', modern: '近代' };
  return map[era] || era;
};

export const formatNumber = (num) => {
  return Number(num).toLocaleString();
};
