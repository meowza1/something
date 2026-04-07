const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'math',
    aliases: ['calc', 'calculate'],
    category: 'utility',
    description: 'Calculate a math expression',
    usage: '<expression>',
    cooldown: 3,
    async execute(message, args, client) {
        const expression = args.join(' ');
        
        if (!expression) {
            return message.reply({ embeds: [errorEmbed('Please provide a math expression.')] });
        }
        
        try {
            const result = Function('"use strict"; return (' + expression + ')')();
            
            const embed = generateEmbed({
                title: '🧮 Calculator',
                fields: [
                    { name: 'Expression', value: `\`${expression}\``, inline: true },
                    { name: 'Result', value: `\`${result}\``, inline: true }
                ],
                color: client.config.embedColor,
                timestamp: true
            });
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply({ embeds: [errorEmbed('Invalid expression.')] });
        }
    }
};