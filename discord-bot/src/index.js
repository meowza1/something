require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection, ActivityType } = require('discord.js');
const { LoadCommands } = require('./handlers/commandHandler.js');
const { LoadEvents } = require('./handlers/eventHandler.js');
const { initializeDatabase } = require('./utils/database.js');
const { registerSlashCommands } = require('./deploy-commands.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution
    ],
    partials: [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.ThreadMember
    ],
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: true
    },
    rest: {
        retries: 3,
        timeout: 15000
    },
    sweepers: {
        messages: {
            interval: 3600,
            filter: () => (message) => message.createdAt < Date.now() - 86400000
        }
    }
});

client.commands = new Collection();
client.slashCommands = new Collection();
client.cooldowns = new Collection();
client.aliases = new Collection();
client.categories = new Set();

client.config = {
    prefix: process.env.PREFIX || '!',
    owners: process.env.OWNER_IDS ? process.env.OWNER_IDS.split(',') : [],
    mongoUri: process.env.MONGODB_URI || null,
    firebaseConfig: process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG) : null,
    devGuildId: process.env.DEV_GUILD_ID || null,
    status: {
        type: ActivityType.Watching,
        name: '{prefix}help | {guildCount} servers'
    },
    embedColor: '#FF6B6B',
    errorColor: '#FF0000',
    successColor: '#00FF00',
    warnColor: '#FFFF00',
    infoColor: '#00FFFF'
};

client.utils = {
    formatDuration: require('./utils/formatDuration.js'),
    formatNumber: require('./utils/formatNumber.js'),
    generateEmbed: require('./utils/embedGenerator.js'),
    pagination: require('./utils/pagination.js'),
    regex: require('./utils/regexPatterns.js'),
    validators: require('./utils/validators.js')
};

client.modules = {
    levelSystem: require('./modules/levelSystem.js'),
    economy: {},
    tickets: {},
    automod: {},
    logging: {},
    reactionRoles: {},
    leveling: require('./modules/leveling.js'),
    achievements: {},
    social: {},
    Giveaways: {},
    polls: {},
    reminders: {},
    starboard: {}
};

process.on('unhandledRejection', (error) => {
    console.error('[UNHANDLED REJECTION]', error);
});

process.on('uncaughtException', (error) => {
    console.error('[UNCAUGHT EXCEPTION]', error);
    process.exit(1);
});

async function startBot() {
    try {
        console.log('[INIT] Initializing database...');
        await initializeDatabase(client);
        
        console.log('[INIT] Loading commands...');
        await LoadCommands(client);
        
        console.log('[INIT] Loading events...');
        await LoadEvents(client);
        
        console.log('[INIT] Registering slash commands...');
        await registerSlashCommands(client);
        
        await client.login(process.env.DISCORD_BOT_TOKEN);
        
        console.log(`[READY] Logged in as ${client.user.tag}`);
        console.log(`[READY] Serving ${client.guilds.cache.size} servers`);
        
        if (client.config.status) {
            client.user.setActivity(client.config.status.name.replace('{prefix}', client.config.prefix).replace('{guildCount}', client.guilds.cache.size), {
                type: client.config.status.type
            });
        }
    } catch (error) {
        console.error('[FATAL ERROR]', error);
        process.exit(1);
    }
}

startBot();

module.exports = client;