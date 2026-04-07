const { generateEmbed, errorEmbed, successEmbed } = require('../../utils/embedGenerator');
const { canModerate } = require('../../utils/permissions');

module.exports = {
    name: 'removerole',
    aliases: ['roleremove'],
    category: 'moderation',
    description: 'Remove a role from a user',
    usage: '<user> <role>',
    cooldown: 5,
    requiredPermissions: ['ManageRoles'],
    async execute(message, args, client) {
        const member = message.mentions.members.first();
        const role = message.mentions.roles.first();
        
        if (!member || !role) {
            return message.reply({ embeds: [errorEmbed('Usage: removerole <user> <role>')] });
        }
        
        await member.roles.remove(role);
        
        message.reply({ embeds: [successEmbed(`Removed ${role.name} from ${member.user.tag}.`)] });
    }
};