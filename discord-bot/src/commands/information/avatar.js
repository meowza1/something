const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'avatar',
    aliases: ['pfp', 'profile', 'av'],
    category: 'information',
    description: 'Get a user\'s avatar',
    usage: '[user]',
    cooldown: 3,
    async execute(message, args, client) {
        const user = message.mentions.users.first() || message.author;
        
        const embed = generateEmbed({
            title: `${user.username}'s Avatar`,
            image: user.displayAvatarURL({ dynamic: true, size: 4096 }),
            color: client.config.embedColor,
            fields: [
                { name: 'Links', value: `[PNG](${user.displayAvatarURL({ format: 'png', size: 4096 })}) | [JPG](${user.displayAvatarURL({ format: 'jpg', size: 4096 })}) | [GIF](${user.displayAvatarURL({ format: 'gif', size: 4096 })})`, inline: false }
            ],
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};