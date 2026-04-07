const { generateEmbed, errorEmbed, successEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'delverole',
    aliases: ['deleterole'],
    category: 'moderation',
    description: 'Delete a role',
    usage: '<role>',
    cooldown: 5,
    requiredPermissions: ['ManageRoles'],
    async execute(message, args, client) {
        const role = message.mentions.roles.first();
        
        if (!role) {
            return message.reply({ embeds: [errorEmbed('Please mention a role to delete.')] });
        }
        
        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply({ embeds: [errorEmbed('I cannot delete this role.')] });
        }
        
        await role.delete();
        
        message.reply({ embeds: [successEmbed(`Deleted role: ${role.name}`)] });
    }
};