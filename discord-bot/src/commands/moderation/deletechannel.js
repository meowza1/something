const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'deletechannel',
    aliases: ['delch'],
    category: 'moderation',
    description: 'Delete a channel',
    usage: '[channel]',
    cooldown: 10,
    requiredPermissions: ['ManageChannels'],
    async execute(message, args, client) {
        const channel = message.mentions.channels.first() || message.channel;
        
        await channel.delete();
        
        message.reply({ embeds: [successEmbed(`Deleted channel: ${channel.name}`)] });
    }
};