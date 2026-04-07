const { generateEmbed, errorEmbed, successEmbed } = require('../../utils/embedGenerator');
const { canModerate } = require('../../utils/permissions');

module.exports = {
    name: 'voicemove',
    aliases: ['vmove'],
    category: 'moderation',
    description: 'Move a user to another voice channel',
    usage: '<user> <channel>',
    cooldown: 5,
    requiredPermissions: ['MoveMembers'],
    async execute(message, args, client) {
        const member = message.mentions.members.first();
        const channel = message.mentions.channels.first();
        
        if (!member || !channel) {
            return message.reply({ embeds: [errorEmbed('Usage: voicemove <user> <channel>')] });
        }
        
        if (!member.voice.channel) {
            return message.reply({ embeds: [errorEmbed('User is not in a voice channel.')] });
        }
        
        await member.voice.setChannel(channel);
        
        message.reply({ embeds: [successEmbed(`Moved ${member.user.tag} to ${channel}.`)] });
    }
};