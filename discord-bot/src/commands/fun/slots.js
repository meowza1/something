const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'slots',
    aliases: ['slotmachine'],
    category: 'fun',
    description: 'Play slot machine',
    cooldown: 10,
    async execute(message, args, client) {
        const emojis = ['🍒', '🍋', '🍇', '💎', '🔔', '⭐'];
        const slots = [
            emojis[Math.floor(Math.random() * emojis.length)],
            emojis[Math.floor(Math.random() * emojis.length)],
            emojis[Math.floor(Math.random() * emojis.length)]
        ];
        
        const isWin = slots[0] === slots[1] && slots[1] === slots[2];
        
        const embed = generateEmbed({
            title: '🎰 Slot Machine',
            description: slots.join(' | ') + '\n\n' + (isWin ? '🎉 **JACKPOT!** 🎉' : 'No win, try again!'),
            color: isWin ? client.config.successColor : client.config.embedColor,
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};