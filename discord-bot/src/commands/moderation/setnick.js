const { generateEmbed, errorEmbed, successEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'setnick',
    aliases: ['setn'],
    category: 'moderation',
    description: 'Set a users nickname (easier alias)',
    usage: '<user> [nickname]',
    cooldown: 5,
    requiredPermissions: ['ManageNicknames'],
    async execute(message, args, client) {
        const member = message.mentions.members.first();
        if (!member) {
            return message.reply({ embeds: [errorEmbed('Please mention a user.')] });
        }
        
        const nickname = args.slice(1).join(' ') || null;
        
        await member.setNickname(nickname);
        
        message.reply({ embeds: [successEmbed(nickname ? `Set ${member.user.tag}'s nickname to: ${nickname}` : `Reset ${member.user.tag}'s nickname`)] });
    }
};