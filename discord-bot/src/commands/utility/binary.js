const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'binary',
    category: 'utility',
    description: 'Convert text to binary',
    usage: '<text>',
    cooldown: 3,
    async execute(message, args, client) {
        const text = args.join(' ');
        
        if (!text) {
            return message.reply('Please provide text to convert.');
        }
        
        const binary = text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        
        const embed = generateEmbed({
            title: '💻 Binary Converter',
            description: '```\n' + (binary.length > 1900 ? binary.slice(0, 1900) + '...' : binary) + '\n```',
            color: client.config.embedColor,
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};