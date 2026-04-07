const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'warn',
    aliases: ['w'],
    category: 'moderation',
    description: 'Warn a user',
    usage: '<user> <reason>',
    cooldown: 5,
    requiredPermissions: ['KickMembers'],
    async execute(message, args, client) {
        const member = message.mentions.members.first();
        
        if (!member) {
            return message.reply({ embeds: [errorEmbed('Please mention a user to warn.')] });
        }
        
        const reason = args.slice(1).join(' ') || 'No reason provided';
        
        if (client.db) {
            const insert = client.db.prepare('INSERT INTO warns (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)');
            insert.run(message.guild.id, member.id, message.author.id, reason);
        }
        
        const embed = generateEmbed({
            title: '⚠️ User Warned',
            description: `${member.user.tag} has been warned`,
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