const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'shrug',
    category: 'fun',
    description: 'Shrug at someone',
    usage: '[text]',
    cooldown: 3,
    async execute(message, args, client) {
        const text = args.join(' ');
        message.reply('¯\\_(ツ)_/¯ ' + text);
    }
};