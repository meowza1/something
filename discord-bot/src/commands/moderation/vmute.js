const { generateEmbed, errorEmbed, successEmbed } = require('../../utils/embedGenerator');
const { canModerate } = require('../../utils/permissions');

module.exports = {
    name: 'vmute',
    category: 'moderation',
    description: 'Mute a user in voice channel',
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
        
        const check = canModerate(message.member, member, message.guild);
        if (!check.allowed) {
            return message.reply({ embeds: [errorEmbed(check.reason)] });
        }
        
        await member.voice.setMute(true);
        
        message.reply({ embeds: [successEmbed(`Muted ${member.user.tag} in voice.`)] });
    }
};