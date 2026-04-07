const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'softban',
    aliases: ['sban'],
    category: 'moderation',
    description: 'Softban a user (ban and immediately unban)',
    usage: '<user> [reason]',
    cooldown: 5,
    requiredPermissions: ['BanMembers'],
    async execute(message, args, client) {
        const member = message.mentions.members.first();
        
        if (!member) {
            return message.reply({ embeds: [errorEmbed('Please mention a user to softban.')] });
        }
        
        const reason = args.slice(1).join(' ') || 'No reason provided';
        
        await member.ban({ reason });
        await message.guild.bans.remove(member.id, { reason: 'Softban' });
        
        const embed = generateEmbed({
            title: '🔨 User Softbanned',
            description: `${member.user.tag} has been softbanned`,
            color: client.config.warnColor,
            fields: [
                { name: 'Reason', value: reason, inline: false }
            ],
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};