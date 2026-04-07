const { generateEmbed } = require('../../utils/embedGenerator');
const { formatDate } = require('../../utils/formatDuration');

module.exports = {
    name: 'serverinfo',
    aliases: ['server', 'guildinfo', 'guild', 'si'],
    category: 'information',
    description: 'Get information about the current server',
    cooldown: 5,
    async execute(message, args, client) {
        const guild = message.guild;
        
        const embed = generateEmbed({
            title: `📊 ${guild.name}`,
            thumbnail: guild.iconURL({ dynamic: true }),
            color: client.config.embedColor,
            fields: [
                { name: 'ID', value: `\`${guild.id}\``, inline: true },
                { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Created', value: formatDate(guild.createdAt), inline: true },
                { name: 'Members', value: `\`${guild.memberCount}\``, inline: true },
                { name: 'Humans', value: `\`${guild.members.cache.filter(m => !m.user.bot).size}\``, inline: true },
                { name: 'Bots', value: `\`${guild.members.cache.filter(m => m.user.bot).size}\``, inline: true },
                { name: 'Channels', value: `\`${guild.channels.cache.size}\``, inline: true },
                { name: 'Roles', value: `\`${guild.roles.cache.size}\``, inline: true },
                { name: 'Emojis', value: `\`${guild.emojis.cache.size}\``, inline: true },
                { name: 'Verification', value: verificationLevel[guild.verificationLevel], inline: true },
                { name: 'Features', value: guild.features.length > 0 ? guild.features.map(f => `\`${f}\``).join(', ') : 'None', inline: false }
            ],
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};

const verificationLevel = {
    0: 'None',
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Very High'
};