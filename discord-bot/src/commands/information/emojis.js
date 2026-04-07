const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'emojis',
    aliases: ['emotes', 'emoji-list'],
    category: 'information',
    description: 'List all emojis in the server',
    cooldown: 5,
    async execute(message, args, client) {
        const emojis = message.guild.emojis.cache;
        
        if (emojis.size === 0) {
            return message.reply('This server has no emojis.');
        }
        
        const animated = emojis.filter(e => e.animated);
        const staticEmojis = emojis.filter(e => !e.animated);
        
        const embed = generateEmbed({
            title: '😀 Server Emojis',
            color: client.config.embedColor,
            fields: [
                { name: `Static (${staticEmojis.size})`, value: staticEmojis.map(e => e.toString()).join(' ') || 'None', inline: false },
                { name: `Animated (${animated.size})`, value: animated.map(e => e.toString()).join(' ') || 'None', inline: false }
            ],
            footer: `Total: ${emojis.size} emojis`
        });
        
        message.reply({ embeds: [embed] });
    }
};