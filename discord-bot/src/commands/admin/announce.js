const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'announce',
    category: 'admin',
    description: 'Create an announcement',
    usage: '<message>',
    cooldown: 10,
    requiredPermissions: ['ManageMessages'],
    async execute(message, args, client) {
        const text = args.join(' ');
        
        if (!text) {
            return message.reply({ embeds: [errorEmbed('Please provide announcement text.')] });
        }
        
        const embed = generateEmbed({
            title: '📢 Announcement',
            description: text,
            color: client.config.embedColor,
            footer: `By ${message.author.tag}`,
            timestamp: true
        });
        
        message.channel.send({ embeds: [embed] });
    }
};