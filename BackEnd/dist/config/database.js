"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatabasePool = createDatabasePool;
exports.getDatabasePool = getDatabasePool;
exports.closeDatabasePool = closeDatabasePool;
exports.testDatabaseConnection = testDatabaseConnection;
const pg_1 = require("pg");
const databaseConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
    min: 2,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
    query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '60000'),
    statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '60000'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};
let pool = null;
function createDatabasePool() {
    if (pool) {
        return pool;
    }
    pool = new pg_1.Pool(databaseConfig);
    pool.on('error', (err) => {
        console.error('❌ Database pool error:', err.message);
    });
    console.log('✅ Database pool created');
    console.log(`   📍 ${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}`);
    return pool;
}
function getDatabasePool() {
    if (!pool) {
        return createDatabasePool();
    }
    return pool;
}
async function closeDatabasePool() {
    if (pool) {
        console.log('🔄 Closing database pool...');
        await pool.end();
        pool = null;
        console.log('✅ Database pool closed');
    }
}
async function testDatabaseConnection() {
    try {
        const dbPool = getDatabasePool();
        const client = await dbPool.connect();
        try {
            await client.query('SELECT NOW()');
            console.log('✅ Database connection test passed');
            return true;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('❌ Database connection test failed:', error);
        return false;
    }
}
exports.default = createDatabasePool;
