const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'warnings',
    aliases: ['warns', 'infractions'],
    category: 'moderation',
    description: 'View warnings for a user',
    usage: '[user]',
    cooldown: 5,
    async execute(message, args, client) {
        const member = message.mentions.members.first() || message.member;
        
        if (!client.db) {
            return message.reply({ embeds: [errorEmbed('Database not available.')] });
        }
        
        const warns = client.db.prepare('SELECT * FROM warns WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC').all(message.guild.id, member.id);
        
        if (warns.length === 0) {
            return message.reply({ embeds: [errorEmbed(`${member.user.tag} has no warnings.`)] });
        }
        
        const embed = generateEmbed({
            title: `⚠️ Warnings for ${member.user.tag}`,
            color: client.config.warnColor,
            fields: warns.slice(0, 10).map((w, i) => ({
                name: `Warning ${i + 1}`,
                value: `**Reason:** ${w.reason}\n**Date:** <t:${Math.floor(new Date(w.created_at).getTime() / 1000)}:R>\n**Moderator:** <@${w.moderator_id}>`,
                inline: false
            })),
            footer: `Total: ${warns.length} warnings`
        });
        
        message.reply({ embeds: [embed] });
    }
};