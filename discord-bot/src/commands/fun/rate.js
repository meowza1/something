const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'rate',
    category: 'fun',
    description: 'Rate something',
    usage: '<thing>',
    cooldown: 5,
    async execute(message, args, client) {
        const thing = args.join(' ');
        
        if (!thing) {
            return message.reply('What do you want me to rate?');
        }
        
        const rating = Math.floor(Math.random() * 11);
        const stars = '★'.repeat(rating) + '☆'.repeat(10 - rating);
        
        const embed = generateEmbed({
            title: '⭐ Rate It!',
            description: `I rate **${thing}** a ${rating}/10\n\n${stars}`,
            color: client.config.embedColor,
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};