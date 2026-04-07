const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'lock',
    aliases: ['lockdown'],
    category: 'moderation',
    description: 'Lock a channel',
    cooldown: 5,
    requiredPermissions: ['ManageChannels'],
    async execute(message, args, client) {
        const channel = message.mentions.channels.first() || message.channel;
        
        await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            SendMessages: false
        });
        
        const embed = generateEmbed({
            title: '🔒 Channel Locked',
            description: `${channel} has been locked.`,
            color: client.config.warnColor,
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};