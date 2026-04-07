const { generateEmbed } = require('../../utils/embedGenerator');

const cats = ['😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🐱'];

module.exports = {
    name: 'cat',
    aliases: ['kitten', 'kitty'],
    category: 'fun',
    description: 'Get a random cat',
    cooldown: 5,
    async execute(message, args, client) {
        const embed = generateEmbed({
            title: `${cats[Math.floor(Math.random() * cats.length)]} Meow!`,
            description: 'Here\'s a cute cat for you!',
            color: client.config.embedColor,
            footer: '🐱 Cat',
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};