const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'channelinfo',
    aliases: ['ci', 'chinfo'],
    category: 'information',
    description: 'Get information about a channel',
    usage: '[channel]',
    cooldown: 5,
    async execute(message, args, client) {
        const channel = message.mentions.channels.first() || message.channel;
        
        const embed = generateEmbed({
            title: `📺 ${channel.name}`,
            color: client.config.embedColor,
            fields: [
                { name: 'ID', value: `\`${channel.id}\``, inline: true },
                { name: 'Type', value: channel.type.toString(), inline: true },
                { name: 'Created', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Position', value: channel.position?.toString() || 'N/A', inline: true }
            ],
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};