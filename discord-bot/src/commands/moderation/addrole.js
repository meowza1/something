const { generateEmbed, errorEmbed, successEmbed } = require('../../utils/embedGenerator');
const { canModerate } = require('../../utils/permissions');

module.exports = {
    name: 'addrole',
    aliases: ['roleadd'],
    category: 'moderation',
    description: 'Add a role to a user',
    usage: '<user> <role>',
    cooldown: 5,
    requiredPermissions: ['ManageRoles'],
    async execute(message, args, client) {
        const member = message.mentions.members.first();
        const role = message.mentions.roles.first();
        
        if (!member || !role) {
            return message.reply({ embeds: [errorEmbed('Usage: addrole <user> <role>')] });
        }
        
        await member.roles.add(role);
        
        message.reply({ embeds: [successEmbed(`Added ${role.name} to ${member.user.tag}.`)] });
    }
};