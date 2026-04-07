const { generateEmbed } = require('../../utils/embedGenerator');

const responses = [
    'It is certain.',
    'Without a doubt.',
    'Yes definitely.',
    'You may rely on it.',
    'My reply is no.',
    'My sources say no.',
    'Very doubtful.'
];

module.exports = {
    name: 'ask',
    aliases: ['fortune'],
    category: 'fun',
    description: 'Ask the bot anything',
    usage: '<question>',
    cooldown: 5,
    async execute(message, args, client) {
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        const embed = generateEmbed({
            title: '🔮 The Oracle Says...',
            description: response,
            color: '#9B59B6'
        });
        
        message.reply({ embeds: [embed] });
    }
};