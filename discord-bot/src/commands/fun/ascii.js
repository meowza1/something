const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'ascii',
    category: 'fun',
    description: 'Convert text to ASCII art',
    usage: '<text>',
    cooldown: 5,
    async execute(message, args, client) {
        const text = args.join(' ');
        
        if (!text) {
            return message.reply('Please provide text to convert.');
        }
        
        if (text.length > 20) {
            return message.reply('Text must be 20 characters or less.');
        }
        
        const ascii = `
╔══════════════════════════════╗
║       ${text.toUpperCase().padEnd(26)}
╚══════════════════════════════╝
        `.trim();
        
        const embed = generateEmbed({
            title: '🎨 ASCII Art',
            description: '```\n' + ascii + '\n```',
            color: client.config.embedColor,
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};