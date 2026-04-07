const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db = null;

function getDatabase() {
    if (!db) {
        const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../data/database.db');
        
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        
        db = new Database(dbPath);
        db.pragma('journal_mode = WAL');
    }
    return db;
}

async function initializeDatabase(client) {
    const db = getDatabase();
    
    db.exec(`
        CREATE TABLE IF NOT EXISTS guilds (
            guild_id TEXT PRIMARY KEY,
            prefix TEXT DEFAULT '!',
            language TEXT DEFAULT 'en',
            automod_enabled INTEGER DEFAULT 0,
            logging_channel TEXT,
            welcome_channel TEXT,
            welcome_message TEXT,
            leave_channel TEXT,
            leave_message TEXT,
            level_system_enabled INTEGER DEFAULT 1,
            economy_enabled INTEGER DEFAULT 1,
            tickets_enabled INTEGER DEFAULT 1,
            starboard_enabled INTEGER DEFAULT 1,
            starboard_channel TEXT,
            starboard_threshold INTEGER DEFAULT 5,
            muted_role TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT,
            guild_id TEXT,
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            messages INTEGER DEFAULT 0,
            voice_time INTEGER DEFAULT 0,
            commands_used INTEGER DEFAULT 0,
            reputation INTEGER DEFAULT 0,
            balance REAL DEFAULT 0,
            bank REAL DEFAULT 0,
            married_to TEXT,
            married_at DATETIME,
            PRIMARY KEY (user_id, guild_id)
        );
        
        CREATE TABLE IF NOT EXISTS warns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            user_id TEXT,
            moderator_id TEXT,
            reason TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS bans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            user_id TEXT,
            moderator_id TEXT,
            reason TEXT,
            expires_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS mutes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            user_id TEXT,
            moderator_id TEXT,
            reason TEXT,
            expires_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            channel_id TEXT,
            user_id TEXT,
            topic TEXT,
            status TEXT DEFAULT 'open',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS command_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            command TEXT,
            user_id TEXT,
            guild_id TEXT,
            used_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS level_rewards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            level INTEGER,
            role_id TEXT,
            UNIQUE(guild_id, level)
        );
        
        CREATE TABLE IF NOT EXISTS reaction_roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            message_id TEXT,
            emoji TEXT,
            role_id TEXT,
            UNIQUE(message_id, emoji)
        );
        
        CREATE TABLE IF NOT EXISTS giveaways (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            channel_id TEXT,
            message_id TEXT,
            prize TEXT,
            winners INTEGER DEFAULT 1,
            ends_at DATETIME,
            required_role TEXT,
            UNIQUE(guild_id, message_id)
        );
        
        CREATE TABLE IF NOT EXISTS giveaway_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            giveaway_id INTEGER,
            user_id TEXT,
            entered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(giveaway_id, user_id)
        );
        
        CREATE TABLE IF NOT EXISTS polls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            channel_id TEXT,
            message_id TEXT,
            question TEXT,
            options TEXT,
            ends_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            guild_id TEXT,
            channel_id TEXT,
            message TEXT,
            remind_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS afk (
            user_id TEXT PRIMARY KEY,
            guild_id TEXT,
            message TEXT,
            set_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS aliases (
            command_name TEXT,
            alias TEXT,
            guild_id TEXT,
            PRIMARY KEY (command_name, alias, guild_id)
        );
        
        CREATE TABLE IF NOT EXISTS guild_settings (
            guild_id TEXT PRIMARY KEY,
            settings TEXT DEFAULT '{}'
        );
        
        CREATE TABLE IF NOT EXISTS user_inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            guild_id TEXT,
            item_id TEXT,
            quantity INTEGER DEFAULT 1,
            acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, guild_id, item_id)
        );
        
        CREATE TABLE IF NOT EXISTS shop_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            item_id TEXT,
            name TEXT,
            description TEXT,
            price REAL,
            role_id TEXT,
            emoji TEXT,
            UNIQUE(guild_id, item_id)
        );
        
        CREATE TABLE IF NOT EXISTS birthdays (
            user_id TEXT,
            guild_id TEXT,
            month INTEGER,
            day INTEGER,
            PRIMARY KEY (user_id, guild_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_users_guild ON users(guild_id);
        CREATE INDEX IF NOT EXISTS idx_warns_guild ON warns(guild_id);
        CREATE INDEX IF NOT EXISTS idx_tickets_guild ON tickets(guild_id);
        CREATE INDEX IF NOT EXISTS idx_command_usage_command ON command_usage(command);
    `);
    
    console.log('[DATABASE] Tables initialized');
    
    client.db = db;
    
    return db;
}

function getDb() {
    return getDatabase();
}

module.exports = { initializeDatabase, getDb };