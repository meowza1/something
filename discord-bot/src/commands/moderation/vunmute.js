const { generateEmbed, errorEmbed, successEmbed } = require('../../utils/embedGenerator');
const { canModerate } = require('../../utils/permissions');

module.exports = {
    name: 'vunmute',
    category: 'moderation',
    description: 'Unmute a user in voice channel',
    usage: '<user>',
    cooldown: 5,
    requiredPermissions: ['MuteMembers'],
    async execute(message, args, client) {
        const member = message.mentions.members.first();
        
        if (!member) {
            return message.reply({ embeds: [errorEmbed('Please mention a user.')] });
        }
        
        if (!member.voice.channel) {
            return message.reply({ embeds: [errorEmbed('User is not in a voice channel.')] });
        }
        
        await member.voice.setMute(false);
        
        message.reply({ embeds: [successEmbed(`Unmuted ${member.user.tag} in voice.`)] });
    }
};