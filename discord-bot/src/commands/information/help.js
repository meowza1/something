const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'help',
    aliases: ['h', 'commands', 'cmds', 'aide', 'ayuda', 'hilfe'],
    category: 'information',
    description: 'Show all available commands or help for a specific command',
    usage: '[command]',
    cooldown: 5,
    async execute(message, args, client) {
        const { prefix } = client.config;
        
        if (args[0]) {
            const cmd = client.commands.get(args[0].toLowerCase()) || 
                        client.commands.get(client.aliases.get(args[0].toLowerCase()));
            
            if (!cmd) {
                return message.reply({ embeds: [errorEmbed(`Command \`${args[0]}\` not found.`)] });
            }
            
            const embed = generateEmbed({
                title: `Help: ${prefix}${cmd.name}`,
                color: client.config.embedColor,
                fields: [
                    { name: 'Description', value: cmd.description || 'No description', inline: false },
                    { name: 'Usage', value: `\`${prefix}${cmd.name} ${cmd.usage || ''}\``, inline: false },
                    { name: 'Category', value: cmd.category || 'general', inline: true },
                    { name: 'Cooldown', value: `${cmd.cooldown || 0} seconds`, inline: true }
                ]
            });
            
            if (cmd.aliases && cmd.aliases.length > 0) {
                embed.addFields([{ name: 'Aliases', value: cmd.aliases.map(a => `\`${a}\``).join(', '), inline: false }]);
            }
            
            if (cmd.requiredPermissions) {
                embed.addFields([{ name: 'Required Permissions', value: cmd.requiredPermissions.join(', '), inline: false }]);
            }
            
            return message.reply({ embeds: [embed] });
        }
        
        const categories = {};
        
        for (const [name, cmd] of client.commands) {
            if (!categories[cmd.category]) {
                categories[cmd.category] = [];
            }
            categories[cmd.category].push(`\`${name}\``);
        }
        
        const embed = generateEmbed({
            title: '📚 Command List',
            description: `Use \`${prefix}help <command>\` for more info on a command`,
            color: client.config.embedColor,
            footer: `Total: ${client.commands.size} commands`
        });
        
        for (const [category, commands] of Object.entries(categories)) {
            embed.addFields([{ name: `${category.charAt(0).toUpperCase() + category.slice(1)} (${commands.length})`, value: commands.join(', '), inline: false }]);
        }
        
        message.reply({ embeds: [embed] });
    }
};