const { generateEmbed } = require('../../utils/embedGenerator');

const answers = [
    'Yes!', 'No.', 'Maybe.', 'Probably.', 'Definitely not.',
    'Ask again later.', 'I think so.', 'Not sure.', 'Of course!', 'Never!'
];

module.exports = {
    name: 'choose',
    aliases: ['pick', 'decide'],
    category: 'fun',
    description: 'Choose between options',
    usage: '<option1> | <option2> | [options...]',
    cooldown: 3,
    async execute(message, args, client) {
        const options = args.join(' ').split('|').map(o => o.trim()).filter(o => o);
        
        if (options.length < 2) {
            return message.reply('Please provide at least 2 options separated by |');
        }
        
        const choice = options[Math.floor(Math.random() * options.length)];
        
        const embed = generateEmbed({
            title: '🤔 I choose...',
            description: choice,
            color: client.config.embedColor,
            fields: [{ name: 'Options', value: options.map(o => `• ${o}`).join('\n'), inline: false }],
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};