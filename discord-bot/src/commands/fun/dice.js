const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'dice',
    aliases: ['roll', 'random'],
    category: 'fun',
    description: 'Roll a dice',
    usage: '[sides]',
    cooldown: 3,
    async execute(message, args, client) {
        const sides = parseInt(args[0]) || 6;
        const rolls = parseInt(args[1]) || 1;
        
        if (sides < 2 || sides > 100) {
            return message.reply('Dice sides must be between 2 and 100.');
        }
        
        if (rolls < 1 || rolls > 100) {
            return message.reply('Maximum 100 rolls at a time.');
        }
        
        const results = Array.from({ length: rolls }, () => Math.floor(Math.random() * sides) + 1);
        const total = results.reduce((a, b) => a + b, 0);
        
        const embed = generateEmbed({
            title: '🎲 Dice Roll',
            description: rolls === 1 ? `You rolled **${results[0]}** on a ${sides}-sided die.` : `You rolled **${results.join(', ')}**\n\n**Total:** ${total}`,
            color: client.config.embedColor,
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};