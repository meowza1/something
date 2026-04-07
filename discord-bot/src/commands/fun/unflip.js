const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'unflip',
    category: 'fun',
    description: 'Unflip the table',
    cooldown: 3,
    async execute(message, args, client) {
        message.reply('┬─┬ノ( º_ºノ)');
    }
};