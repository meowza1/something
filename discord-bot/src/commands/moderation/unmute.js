const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'unmute',
    aliases: ['um'],
    category: 'moderation',
    description: 'Unmute a user',
    usage: '<user>',
    cooldown: 5,
    requiredPermissions: ['MuteMembers'],
    async execute(message, args, client) {
        const member = message.mentions.members.first();
        
        if (!member) {
            return message.reply({ embeds: [errorEmbed('Please mention a user to unmute.')] });
        }
        
        try {
            await member.timeout(null);
            
            const embed = generateEmbed({
                title: '🔊 User Unmuted',
                description: `${member.user.tag} has been unmuted`,
                color: client.config.successColor,
                timestamp: true
            });
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply({ embeds: [errorEmbed('Failed to unmute this user.')] });
        }
    }
};