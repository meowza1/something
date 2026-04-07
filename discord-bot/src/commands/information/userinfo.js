const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'userinfo',
    aliases: ['user', 'whois', 'ui'],
    category: 'information',
    description: 'Get information about a user',
    usage: '[user]',
    cooldown: 5,
    async execute(message, args, client) {
        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id) || await message.guild.members.fetch(user.id).catch(() => null);
        
        const embed = generateEmbed({
            title: `👤 ${user.tag}`,
            thumbnail: user.displayAvatarURL({ dynamic: true }),
            color: user.accentColor || client.config.embedColor,
            fields: [
                { name: 'ID', value: `\`${user.id}\``, inline: true },
                { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: 'Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
            ]
        });
        
        if (member) {
            embed.addFields([
                { name: 'Joined', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: 'Nickname', value: member.nickname || 'None', inline: true },
                { name: 'Roles', value: member.roles.cache.size - 1 > 0 ? member.roles.cache.slice(0, 10).map(r => r).join(', ') + (member.roles.cache.size - 1 > 10 ? ` +${member.roles.cache.size - 1}` : '') : 'None', inline: false }
            ]);
            
            if (member.premiumSince) {
                embed.addFields([{ name: 'Booster Since', value: `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>`, inline: true }]);
            }
        }
        
        embed.setFooter({ text: `Requested by ${message.author.tag}` });
        embed.setTimestamp();
        
        message.reply({ embeds: [embed] });
    }
};