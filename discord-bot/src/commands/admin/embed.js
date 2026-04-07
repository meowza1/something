const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'embed',
    category: 'admin',
    description: 'Create an embed message',
    usage: '<title> | <description>',
    cooldown: 5,
    requiredPermissions: ['ManageMessages'],
    async execute(message, args, client) {
        const content = args.join(' ').split('|');
        
        if (content.length < 2) {
            return message.reply({ embeds: [errorEmbed('Usage: !embed <title> | <description>')] });
        }
        
        const title = content[0].trim();
        const description = content.slice(1).join('|').trim();
        
        const embed = generateEmbed({
            title,
            description,
            color: client.config.embedColor,
            timestamp: true
        });
        
        message.channel.send({ embeds: [embed] });
    }
};