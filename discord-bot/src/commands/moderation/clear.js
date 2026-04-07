const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'clear',
    aliases: ['purge', 'delete', 'prune'],
    category: 'moderation',
    description: 'Delete messages',
    usage: '<amount> [user]',
    cooldown: 10,
    requiredPermissions: ['ManageMessages'],
    async execute(message, args, client) {
        const amount = parseInt(args[0]);
        
        if (!amount || amount < 1 || amount > 1000) {
            return message.reply({ embeds: [errorEmbed('Please provide an amount between 1 and 1000.')] });
        }
        
        const user = message.mentions.users.first();
        
        let messages = await message.channel.messages.fetch({ limit: amount });
        
        if (user) {
            messages = messages.filter(m => m.author.id === user.id);
            messages = [...messages.values()].slice(0, amount);
        }
        
        const deleted = await message.channel.bulkDelete(messages, true);
        
        const embed = generateEmbed({
            title: '🗑️ Messages Deleted',
            description: `Deleted ${deleted.size} messages`,
            color: client.config.successColor,
            fields: user ? [{ name: 'Filter', value: `From ${user.tag}`, inline: true }] : [],
            timestamp: true
        });
        
        message.reply({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 3000));
    }
};