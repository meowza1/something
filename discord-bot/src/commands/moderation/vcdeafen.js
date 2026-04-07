const { generateEmbed, errorEmbed, successEmbed } = require('../../utils/embedGenerator');
const { canModerate } = require('../../utils/permissions');

module.exports = {
    name: 'vcdeafen',
    category: 'moderation',
    description: 'Deafen a user in voice channel',
    usage: '<user>',
    cooldown: 5,
    requiredPermissions: ['DeafenMembers'],
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
        
        await member.voice.setDeaf(true);
        
        message.reply({ embeds: [successEmbed(`Deafened ${member.user.tag}.`)] });
    }
};