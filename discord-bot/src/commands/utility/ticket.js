const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');
const { ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ticket',
    aliases: ['ticketcreate', 'tcreate'],
    category: 'utility',
    description: 'Create a support ticket',
    usage: '<reason>',
    cooldown: 30,
    async execute(message, args, client) {
        const reason = args.join(' ') || 'No reason provided';
        
        if (!client.db) {
            return message.reply('Database not available.');
        }
        
        const existingTicket = client.db.prepare('SELECT * FROM tickets WHERE user_id = ? AND guild_id = ? AND status = ?').get(message.author.id, message.guild.id, 'open');
        
        if (existingTicket) {
            return message.reply({ embeds: [errorEmbed('You already have an open ticket.')] });
        }
        
        const ticketChannel = await message.guild.channels.create({
            name: `ticket-${message.author.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: message.author.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                }
            ]
        });
        
        client.db.prepare('INSERT INTO tickets (guild_id, channel_id, user_id, topic, status) VALUES (?, ?, ?, ?, ?)').run(message.guild.id, ticketChannel.id, message.author.id, reason, 'open');
        
        const embed = generateEmbed({
            title: '🎫 Support Ticket',
            description: `**Topic:** ${reason}\n\nPlease describe your issue in detail. A staff member will assist you shortly.`,
            color: client.config.embedColor,
            fields: [
                { name: 'Created by', value: message.author.toString(), inline: true }
            ],
            timestamp: true
        });
        
        await ticketChannel.send({ embeds: [embed] });
        await ticketChannel.send(message.author.toString());
        
        message.reply({ embeds: [generateEmbed({ title: '✅ Ticket Created', description: `Your ticket has been created: ${ticketChannel}`, color: client.config.successColor })] });
    }
};