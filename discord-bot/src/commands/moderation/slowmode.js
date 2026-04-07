const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'slowmode',
    aliases: ['slow'],
    category: 'moderation',
    description: 'Set slowmode for a channel',
    usage: '[seconds]',
    cooldown: 5,
    requiredPermissions: ['ManageChannels'],
    async execute(message, args, client) {
        const seconds = parseInt(args[0]);
        
        if (!args[0]) {
            await message.channel.setRateLimitPerUser(0);
            return message.reply({ embeds: [generateEmbed({ title: '✅ Slowmode Removed', description: 'Slowmode has been disabled', color: client.config.successColor })] });
        }
        
        if (isNaN(seconds) || seconds < 1 || seconds > 21600) {
            return message.reply({ embeds: [errorEmbed('Please provide a duration between 1 and 21600 seconds (6 hours).')] });
        }
        
        await message.channel.setRateLimitPerUser(seconds);
        
        const embed = generateEmbed({
            title: '✅ Slowmode Set',
            description: `This channel now has a ${seconds} second slowmode`,
            color: client.config.successColor,
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};