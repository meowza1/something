const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'nick',
    aliases: ['setnick', 'nickname'],
    category: 'moderation',
    description: 'Change a user\'s nickname',
    usage: '<user> [nickname]',
    cooldown: 5,
    requiredPermissions: ['ManageNicknames'],
    async execute(message, args, client) {
        const member = message.mentions.members.first();
        
        if (!member) {
            return message.reply({ embeds: [errorEmbed('Please mention a user.')] });
        }
        
        const nickname = args.slice(1).join(' ');
        
        try {
            await member.setNickname(nickname || null);
            
            const embed = generateEmbed({
                title: nickname ? '✅ Nickname Changed' : '✅ Nickname Reset',
                description: `${member.user.tag}'s nickname is now: ${nickname || 'Reset'}`,
                color: client.config.successColor,
                timestamp: true
            });
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply({ embeds: [errorEmbed('Failed to change nickname.')] });
        }
    }
};