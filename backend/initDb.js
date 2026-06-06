import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const initDatabase = async () => {
  console.log('Initializing database...');

  await run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    stamina INTEGER DEFAULT 100,
    maxStamina INTEGER DEFAULT 100,
    gold INTEGER DEFAULT 10000,
    gems INTEGER DEFAULT 10,
    restorerProficiency REAL DEFAULT 50.0,
    museumScore INTEGER DEFAULT 0,
    totalArtifacts INTEGER DEFAULT 0,
    excavationDepth INTEGER DEFAULT 0,
    repairSuccessRate REAL DEFAULT 70.0,
    teamName TEXT DEFAULT '考古队',
    toolQuality TEXT DEFAULT 'good',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS artifacts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    rarity TEXT NOT NULL,
    era TEXT NOT NULL,
    completeness INTEGER DEFAULT 50,
    score INTEGER DEFAULT 0,
    description TEXT,
    affixes TEXT DEFAULT '[]',
    image TEXT DEFAULT '🏺',
    isRepaired INTEGER DEFAULT 0,
    isIdentified INTEGER DEFAULT 0,
    excavatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    description TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS museum_halls (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    theme TEXT NOT NULL,
    unlocked INTEGER DEFAULT 1,
    ticketBonus REAL DEFAULT 1.0,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS museum_slots (
    id TEXT PRIMARY KEY,
    hallId TEXT NOT NULL,
    artifactId TEXT,
    positionX INTEGER NOT NULL,
    positionY INTEGER NOT NULL,
    size TEXT DEFAULT 'medium',
    FOREIGN KEY (hallId) REFERENCES museum_halls(id),
    FOREIGN KEY (artifactId) REFERENCES artifacts(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS market_listings (
    id TEXT PRIMARY KEY,
    sellerId TEXT NOT NULL,
    sellerName TEXT NOT NULL,
    itemType TEXT NOT NULL,
    itemName TEXT NOT NULL,
    rarity TEXT NOT NULL,
    price INTEGER NOT NULL,
    suggestedMin INTEGER,
    suggestedMax INTEGER,
    listedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sellerId) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS competitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    season INTEGER DEFAULT 1,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    isActive INTEGER DEFAULT 1
  )`);

  await run(`CREATE TABLE IF NOT EXISTS competition_entries (
    id TEXT PRIMARY KEY,
    competitionId TEXT NOT NULL,
    playerId TEXT NOT NULL,
    playerName TEXT NOT NULL,
    artifactIds TEXT DEFAULT '[]',
    score INTEGER DEFAULT 0,
    rank INTEGER DEFAULT 0,
    FOREIGN KEY (competitionId) REFERENCES competitions(id),
    FOREIGN KEY (playerId) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS guilds (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    leaderId TEXT NOT NULL,
    leaderName TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    gold INTEGER DEFAULT 0,
    reputation INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leaderId) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS guild_members (
    id TEXT PRIMARY KEY,
    guildId TEXT NOT NULL,
    userId TEXT NOT NULL,
    userName TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    contribution INTEGER DEFAULT 0,
    joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guildId) REFERENCES guilds(id),
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS guild_buildings (
    id TEXT PRIMARY KEY,
    guildId TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    maxLevel INTEGER DEFAULT 10,
    bonus TEXT,
    upgradeCost TEXT,
    FOREIGN KEY (guildId) REFERENCES guilds(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS guild_materials (
    id TEXT PRIMARY KEY,
    guildId TEXT NOT NULL,
    materialId TEXT NOT NULL,
    materialName TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    FOREIGN KEY (guildId) REFERENCES guilds(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS ruin_wars (
    id TEXT PRIMARY KEY,
    ruinName TEXT NOT NULL,
    guildAId TEXT NOT NULL,
    guildAName TEXT NOT NULL,
    guildBId TEXT NOT NULL,
    guildBName TEXT NOT NULL,
    status TEXT DEFAULT 'upcoming',
    startTime DATETIME,
    endTime DATETIME,
    winnerId TEXT,
    scoreA INTEGER DEFAULT 0,
    scoreB INTEGER DEFAULT 0,
    FOREIGN KEY (guildAId) REFERENCES guilds(id),
    FOREIGN KEY (guildBId) REFERENCES guilds(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS ruin_sites (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    difficulty INTEGER DEFAULT 1,
    minLevel INTEGER DEFAULT 1,
    staminaCost INTEGER DEFAULT 15,
    era TEXT NOT NULL,
    depth INTEGER DEFAULT 50
  )`);

  console.log('Database initialized!');

  const ruinCount = await get('SELECT COUNT(*) as count FROM ruin_sites');
  if (ruinCount.count === 0) {
    const ruins = [
      ['ruin1', '遗忘神殿', '传说中供奉古神的神秘神殿', 3, 1, 15, 'ancient', 50],
      ['ruin2', '龙巢废墟', '古龙栖息的巢穴', 5, 10, 25, 'classical', 120],
      ['ruin3', '精灵森林遗迹', '古老精灵文明的失落之城', 4, 15, 20, 'medieval', 80],
      ['ruin4', '冰封王座', '被冰雪封印的古代王国', 7, 25, 35, 'renaissance', 200],
      ['ruin5', '深渊地牢', '连接地底世界的神秘入口', 9, 35, 50, 'ancient', 500]
    ];
    for (const r of ruins) {
      await run(`INSERT INTO ruin_sites (id, name, description, difficulty, minLevel, staminaCost, era, depth) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, r);
    }
    console.log('Ruin sites initialized!');
  }

  const compCount = await get('SELECT COUNT(*) as count FROM competitions');
  if (compCount.count === 0) {
    const startDate = new Date(Date.now() - 86400000 * 2).toISOString();
    const endDate = new Date(Date.now() + 86400000 * 5).toISOString();
    await run(`INSERT INTO competitions (id, name, season, startDate, endDate, isActive) VALUES (?, ?, ?, ?, ?, 1)`,
      ['comp_001', '第一届全服考古大赛', 1, startDate, endDate]);
    console.log('Competition initialized!');
  }

  const annCount = await get('SELECT COUNT(*) as count FROM announcements');
  if (annCount.count === 0) {
    await run(`INSERT INTO announcements (id, type, message) VALUES (?, ?, ?)`,
      ['ann_001', 'system', '🎉 欢迎来到魔法遗迹考古世界！祝大家探险愉快！']);
    await run(`INSERT INTO announcements (id, type, message) VALUES (?, ?, ?)`,
      ['ann_002', 'competition', '🏆 第一届全服考古大赛火热进行中，快来参与！']);
    console.log('Announcements initialized!');
  }

  console.log('✅ Database initialization complete!');
};

initDatabase()
  .then(() => {
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database init error:', err);
    db.close();
    process.exit(1);
  });
