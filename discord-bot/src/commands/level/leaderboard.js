const { generateEmbed } = require('../../utils/embedGenerator');
const { pagination } = require('../../utils/pagination');

module.exports = {
    name: 'leaderboard',
    aliases: ['lb', 'top'],
    category: 'level',
    description: 'View the server leaderboard',
    cooldown: 10,
    async execute(message, args, client) {
        if (!client.db) {
            return message.reply('Database not available.');
        }
        
        const users = client.db.prepare('SELECT * FROM users WHERE guild_id = ? ORDER BY xp DESC LIMIT 50').all(message.guild.id);
        
        if (users.length === 0) {
            return message.reply('No users on the leaderboard yet.');
        }
        
        const pages = [];
        const chunkSize = 10;
        
        for (let i = 0; i < users.length; i += chunkSize) {
            const chunk = users.slice(i, i + chunkSize);
            const pageNum = Math.floor(i / chunkSize) + 1;
            
            const embed = generateEmbed({
                title: `🏆 Leaderboard (Page ${pageNum}/${Math.ceil(users.length / chunkSize)})`,
                color: client.config.embedColor,
                fields: chunk.map((u, idx) => {
                    const user = client.users.cache.get(u.user_id) || { tag: 'Unknown User' };
                    return {
                        name: `#${i + idx + 1} ${user.tag}`,
                        value: `Level: ${u.level} | XP: ${u.xp}`,
                        inline: false
                    };
                })
            });
            
            pages.push(embed);
        }
        
        if (pages.length === 1) {
            return message.reply({ embeds: [pages[0]] });
        }
        
        pagination(client, message, pages);
    }
};