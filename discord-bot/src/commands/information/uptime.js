const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'uptime',
    aliases: ['up'],
    category: 'information',
    description: 'Check bot uptime',
    cooldown: 3,
    async execute(message, args, client) {
        const totalSeconds = Math.floor(process.uptime());
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        const embed = generateEmbed({
            title: '⏱️ Bot Uptime',
            description: `${hours}h ${minutes}m ${seconds}s`,
            color: client.config.embedColor,
            fields: [
                { name: 'Hours', value: hours.toString(), inline: true },
                { name: 'Minutes', value: minutes.toString(), inline: true },
                { name: 'Seconds', value: seconds.toString(), inline: true }
            ],
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};