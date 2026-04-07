const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'tickets',
    aliases: ['ticketslist', 'tlist'],
    category: 'utility',
    description: 'List all open tickets',
    cooldown: 5,
    requiredPermissions: ['ManageChannels'],
    async execute(message, args, client) {
        if (!client.db) {
            return message.reply('Database not available.');
        }
        
        const tickets = client.db.prepare('SELECT * FROM tickets WHERE guild_id = ? AND status = ?').all(message.guild.id, 'open');
        
        if (tickets.length === 0) {
            return message.reply({ embeds: [errorEmbed('No open tickets.')] });
        }
        
        const embed = generateEmbed({
            title: '🎫 Open Tickets',
            color: client.config.embedColor,
            fields: tickets.map(t => ({
                name: `Ticket #${t.id}`,
                value: `Channel: <#${t.channel_id}>\nUser: <@${t.user_id}>\nTopic: ${t.topic}`,
                inline: false
            })),
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};