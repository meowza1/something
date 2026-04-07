const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'decode',
    aliases: ['base64decode'],
    category: 'utility',
    description: 'Decode base64 text',
    usage: '<text>',
    cooldown: 3,
    async execute(message, args, client) {
        const text = args.join(' ');
        
        if (!text) {
            return message.reply({ embeds: [errorEmbed('Please provide text to decode.')] });
        }
        
        try {
            const decoded = Buffer.from(text, 'base64').toString('utf-8');
            
            const embed = generateEmbed({
                title: '🔓 Decoded',
                description: '```\n' + decoded + '\n```',
                color: client.config.embedColor,
                timestamp: true
            });
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply({ embeds: [errorEmbed('Invalid base64 text.')] });
        }
    }
};