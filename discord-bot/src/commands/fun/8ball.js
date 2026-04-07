const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: '8ball',
    aliases: ['8b', 'fortune'],
    category: 'fun',
    description: 'Ask the magic 8ball a question',
    usage: '<question>',
    cooldown: 5,
    async execute(message, args, client) {
        const responses = [
            'It is certain.', 'Without a doubt.', 'Yes definitely.', 'You may rely on it.',
            'As I see it, yes.', 'Most likely.', 'Outlook good.', 'Yes.',
            'Signs point to yes.', 'Reply hazy, try again.', 'Ask again later.',
            'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.',
            "Don't count on it.", 'My reply is no.', 'My sources say no.',
            'Outlook not so good.', 'Very doubtful.'
        ];
        
        const question = args.join(' ');
        
        if (!question) {
            return message.reply('Please ask a question.');
        }
        
        const embed = generateEmbed({
            title: '🎱 Magic 8ball',
            description: `**Question:** ${question}\n\n**Answer:** ${responses[Math.floor(Math.random() * responses.length)]}`,
            color: client.config.embedColor,
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};