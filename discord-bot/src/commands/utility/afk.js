const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'afk',
    aliases: ['away', 'busy'],
    category: 'utility',
    description: 'Set your AFK status',
    usage: '[message]',
    cooldown: 5,
    async execute(message, args, client) {
        const reason = args.join(' ') || 'AFK';
        
        if (client.db) {
            const insert = client.db.prepare('INSERT OR REPLACE INTO afk (user_id, guild_id, message, set_at) VALUES (?, ?, ?, ?)');
            insert.run(message.author.id, message.guild.id, reason, new Date().toISOString());
        }
        
        const embed = generateEmbed({
            title: '😴 AFK Set',
            description: `${message.author.tag} is now AFK: ${reason}`,
            color: client.config.embedColor
        });
        
        message.reply({ embeds: [embed] });
    }
};