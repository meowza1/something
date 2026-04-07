const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'flip',
    aliases: ['coin', 'coinflip'],
    category: 'fun',
    description: 'Flip a coin',
    cooldown: 3,
    async execute(message, args, client) {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        const emoji = result === 'Heads' ? '🪙' : '🔴';
        
        const embed = generateEmbed({
            title: '🪙 Coin Flip',
            description: `${emoji} **${result}**`,
            color: client.config.embedColor,
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};