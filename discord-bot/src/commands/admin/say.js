const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'say',
    aliases: ['echo', 'repeat'],
    category: 'admin',
    description: 'Make the bot say something',
    usage: '<text>',
    cooldown: 5,
    requiredPermissions: ['ManageMessages'],
    async execute(message, args, client) {
        const text = args.join(' ');
        
        if (!text) {
            return message.reply({ embeds: [errorEmbed('Please provide text to say.')] });
        }
        
        message.delete().catch(() => {});
        message.channel.send(text);
    }
};