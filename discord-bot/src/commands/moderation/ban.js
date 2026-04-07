const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'ban',
    aliases: ['b'],
    category: 'moderation',
    description: 'Ban a user from the server',
    usage: '<user> [reason]',
    cooldown: 5,
    requiredPermissions: ['BanMembers'],
    async execute(message, args, client) {
        const member = message.mentions.members.first();
        
        if (!member) {
            return message.reply({ embeds: [errorEmbed('Please mention a user to ban.')] });
        }
        
        if (!member.bannable) {
            return message.reply({ embeds: [errorEmbed('I cannot ban this user.')] });
        }
        
        const reason = args.slice(1).join(' ') || 'No reason provided';
        
        await message.guild.bans.create(member.id, { reason });
        
        const embed = generateEmbed({
            title: '🔨 User Banned',
            description: `${member.user.tag} has been banned from the server`,
            color: client.config.errorColor,
            fields: [
                { name: 'User', value: member.toString(), inline: true },
                { name: 'Moderator', value: message.author.toString(), inline: true },
                { name: 'Reason', value: reason, inline: false }
            ],
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};