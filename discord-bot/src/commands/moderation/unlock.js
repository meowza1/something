const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'unlock',
    category: 'moderation',
    description: 'Unlock a channel',
    cooldown: 5,
    requiredPermissions: ['ManageChannels'],
    async execute(message, args, client) {
        const channel = message.mentions.channels.first() || message.channel;
        
        await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            SendMessages: null
        });
        
        const embed = generateEmbed({
            title: '🔓 Channel Unlocked',
            description: `${channel} has been unlocked.`,
            color: client.config.successColor,
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};