const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'unban',
    aliases: ['ub'],
    category: 'moderation',
    description: 'Unban a user from the server',
    usage: '<user_id> [reason]',
    cooldown: 5,
    requiredPermissions: ['BanMembers'],
    async execute(message, args, client) {
        const userId = args[0];
        
        if (!userId) {
            return message.reply({ embeds: [errorEmbed('Please provide a user ID to unban.')] });
        }
        
        const reason = args.slice(1).join(' ') || 'No reason provided';
        
        try {
            await message.guild.bans.remove(userId, { reason });
            
            const embed = generateEmbed({
                title: '✅ User Unbanned',
                description: `<@${userId}> has been unbanned`,
                color: client.config.successColor,
                fields: [
                    { name: 'Moderator', value: message.author.toString(), inline: true },
                    { name: 'Reason', value: reason, inline: false }
                ],
                timestamp: true
            });
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply({ embeds: [errorEmbed('Could not unban this user.')] });
        }
    }
};