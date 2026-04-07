const { generateEmbed } = require('../../utils/embedGenerator');

const mockResponses = [
    'It is certain.',
    'Without a doubt.',
    'Yes definitely.',
    'You may rely on it.',
    'As I see it, yes.',
    'Most likely.',
    'Outlook good.',
    'Yes.',
    'Signs point to yes.',
    'Reply hazy, try again.',
    'Ask again later.',
    'Better not tell you now.',
    'Cannot predict now.',
    'Concentrate and ask again.',
    "Don't count on it.",
    'My reply is no.',
    'My sources say no.',
    'Outlook not so good.',
    'Very doubtful.'
];

module.exports = {
    name: 'magic8ball',
    aliases: ['m8b'],
    category: 'fun',
    description: 'Ask the magic 8 ball a question',
    usage: '<question>',
    cooldown: 3,
    async execute(message, args, client) {
        const question = args.join(' ');
        
        if (!question) {
            return message.reply('Ask a question!');
        }
        
        const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        
        const embed = generateEmbed({
            title: '🎱 Magic 8 Ball',
            description: `**Q:** ${question}\n\n**A:** ${response}`,
            color: '#23272A'
        });
        
        message.reply({ embeds: [embed] });
    }
};