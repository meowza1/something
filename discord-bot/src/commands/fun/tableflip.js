const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'tableflip',
    category: 'fun',
    description: 'Flip a table',
    cooldown: 3,
    async execute(message, args, client) {
        message.reply('(╯°□°）╯︵ ┻━┻');
    }
};