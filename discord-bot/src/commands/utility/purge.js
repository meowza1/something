const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'purge',
    aliases: ['purgedm'],
    category: 'utility',
    description: 'Delete your DMs with the bot',
    cooldown: 30,
    async execute(message, args, client) {
        try {
            const dms = await message.author.fetch();
            let count = 0;
            
            for (const channel of dms.channels.cache.values()) {
                if (channel.type === 1) {
                    await channel.delete();
                    count++;
                }
            }
            
            const embed = generateEmbed({
                title: '🗑️ DMs Purged',
                description: `Deleted ${count} DM channel(s).`,
                color: client.config.successColor,
                timestamp: true
            });
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply({ embeds: [errorEmbed('Failed to purge DMs.')] });
        }
    }
};