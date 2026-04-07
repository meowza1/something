const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'level',
    aliases: ['rank', 'xp', 'lvl'],
    category: 'level',
    description: 'Check your level and XP',
    usage: '[user]',
    cooldown: 5,
    async execute(message, args, client) {
        const user = message.mentions.users.first() || message.author;
        
        if (!client.db) {
            return message.reply('Database not available.');
        }
        
        let userData = client.db.prepare('SELECT * FROM users WHERE user_id = ? AND guild_id = ?').get(user.id, message.guild.id);
        
        if (!userData) {
            userData = { xp: 0, level: 1, messages: 0 };
        }
        
        const xpForNextLevel = (userData.level + 1) * 100;
        const progress = Math.floor((userData.xp / xpForNextLevel) * 10);
        const bar = '█'.repeat(progress) + '░'.repeat(10 - progress);
        
        const embed = generateEmbed({
            title: `📊 ${user.username}'s Level`,
            thumbnail: user.displayAvatarURL({ dynamic: true }),
            color: client.config.embedColor,
            fields: [
                { name: 'Level', value: `**${userData.level}**`, inline: true },
                { name: 'XP', value: `**${userData.xp}** / ${xpForNextLevel}`, inline: true },
                { name: 'Progress', value: `${bar} ${Math.floor((userData.xp / xpForNextLevel) * 100)}%`, inline: false },
                { name: 'Messages', value: `${userData.messages}`, inline: true }
            ],
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};