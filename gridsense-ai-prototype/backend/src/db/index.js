// =============================================================================
// GridSense AI - Database Repository Selector
// Handles graceful fallback between PostgreSQL and In-Memory demo storage.
// =============================================================================

const inMemoryStore = require('./inMemoryStore');
const PostgresStore = require('./postgresStore');

let activeStore = inMemoryStore;
let storeType = 'in_memory';
let connectionError = null;

async function initDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log('[Storage] DATABASE_URL not set. Running in In-Memory Repository mode (Zero-dependency prototype).');
    activeStore = inMemoryStore;
    storeType = 'in_memory';
    return activeStore;
  }

  try {
    const pgStore = new PostgresStore(databaseUrl);
    await pgStore.testConnection();
    console.log('[Storage] Successfully connected to PostgreSQL instance.');
    activeStore = pgStore;
    storeType = 'postgresql';
    connectionError = null;
  } catch (err) {
    console.warn(`[Storage] Failed to connect to PostgreSQL (${err.message}). Gracefully falling back to In-Memory Repository.`);
    activeStore = inMemoryStore;
    storeType = 'in_memory_fallback';
    connectionError = err.message;
  }

  return activeStore;
}

function getDb() {
  return activeStore;
}

function getDbStatus() {
  return {
    type: storeType,
    isPostgres: storeType === 'postgresql',
    fallbackActive: storeType.includes('fallback') || storeType === 'in_memory',
    connectionError
  };
}

module.exports = {
  initDb,
  getDb,
  getDbStatus
};
