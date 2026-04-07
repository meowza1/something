const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'encode',
    aliases: ['base64'],
    category: 'utility',
    description: 'Encode text to base64',
    usage: '<text>',
    cooldown: 3,
    async execute(message, args, client) {
        const text = args.join(' ');
        
        if (!text) {
            return message.reply({ embeds: [errorEmbed('Please provide text to encode.')] });
        }
        
        const encoded = Buffer.from(text).toString('base64');
        
        const embed = generateEmbed({
            title: '🔐 Encoded (Base64)',
            description: '```\n' + encoded + '\n```',
            color: client.config.embedColor,
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};