const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'clap',
    category: 'fun',
    description: 'Clap back at someone',
    usage: '<text>',
    cooldown: 5,
    async execute(message, args, client) {
        const text = args.join(' ');
        
        if (!text) {
            return message.reply('What do you want to clap back?');
        }
        
        const clapped = text.split(' ').join(' 👏 ');
        message.reply('👏 ' + clapped + ' 👏');
    }
};