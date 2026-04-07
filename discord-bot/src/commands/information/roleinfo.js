const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'roleinfo',
    aliases: ['ri'],
    category: 'information',
    description: 'Get information about a role',
    usage: '<role>',
    cooldown: 5,
    async execute(message, args, client) {
        const role = message.mentions.roles.first() || message.guild.roles.cache.find(r => r.name.toLowerCase().includes(args.join(' ').toLowerCase()));
        
        if (!role) {
            return message.reply('Please provide a valid role.');
        }
        
        const embed = generateEmbed({
            title: `📛 ${role.name}`,
            color: role.color,
            fields: [
                { name: 'ID', value: `\`${role.id}\``, inline: true },
                { name: 'Color', value: `\`${role.color.toString(16).toUpperCase()}\``, inline: true },
                { name: 'Position', value: `\`${role.position}\``, inline: true },
                { name: 'Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Members', value: `\`${role.members.size}\``, inline: true },
                { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
                { name: 'Managed', value: role.managed ? 'Yes' : 'No', inline: true },
                { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true }
            ],
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};