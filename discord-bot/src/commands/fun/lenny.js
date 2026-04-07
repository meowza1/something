const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'lenny',
    category: 'fun',
    description: 'Send a lenny face',
    cooldown: 3,
    async execute(message, args, client) {
        message.reply('( ͡° ͜ʖ ͡°)');
    }
};