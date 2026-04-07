const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'kick',
    aliases: ['k'],
    category: 'moderation',
    description: 'Kick a user from the server',
    usage: '<user> [reason]',
    cooldown: 5,
    requiredPermissions: ['KickMembers'],
    async execute(message, args, client) {
        const member = message.mentions.members.first();
        
        if (!member) {
            return message.reply({ embeds: [errorEmbed('Please mention a user to kick.')] });
        }
        
        if (!member.kickable) {
            return message.reply({ embeds: [errorEmbed('I cannot kick this user.')] });
        }
        
        const reason = args.slice(1).join(' ') || 'No reason provided';
        
        await member.kick(reason);
        
        const embed = generateEmbed({
            title: '👢 User Kicked',
            description: `${member.user.tag} has been kicked from the server`,
            color: client.config.warnColor,
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