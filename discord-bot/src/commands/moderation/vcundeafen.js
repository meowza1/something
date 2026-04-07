const { generateEmbed, errorEmbed, successEmbed } = require('../../utils/embedGenerator');
const { canModerate } = require('../../utils/permissions');

module.exports = {
    name: 'vcundeafen',
    category: 'moderation',
    description: 'Undeafen a user in voice channel',
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
        
        await member.voice.setDeaf(false);
        
        message.reply({ embeds: [successEmbed(`Undeafened ${member.user.tag}.`)] });
    }
};