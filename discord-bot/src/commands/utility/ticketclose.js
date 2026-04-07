const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'ticketclose',
    aliases: ['tclose', 'close'],
    category: 'utility',
    description: 'Close a ticket',
    cooldown: 5,
    requiredPermissions: ['ManageChannels'],
    async execute(message, args, client) {
        if (!message.channel.name.startsWith('ticket-')) {
            return message.reply({ embeds: [errorEmbed('This command can only be used in ticket channels.')] });
        }
        
        if (!client.db) {
            return message.reply('Database not available.');
        }
        
        client.db.prepare('UPDATE tickets SET status = ? WHERE channel_id = ? AND guild_id = ?').run('closed', message.channel.id, message.guild.id);
        
        await message.channel.delete();
        
        message.author.send({ embeds: [generateEmbed({ title: '🎫 Ticket Closed', description: 'Your support ticket has been closed.', color: client.config.successColor })] }).catch(() => {});
    }
};