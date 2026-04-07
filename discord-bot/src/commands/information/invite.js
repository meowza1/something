const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'invite',
    category: 'information',
    description: 'Create an invite link for the server',
    usage: '[channel]',
    cooldown: 10,
    async execute(message, args, client) {
        let channel = message.mentions.channels.first();
        
        if (!channel) {
            channel = message.channel;
        }
        
        try {
            const invite = await channel.createInvite({
                maxAge: 86400,
                maxUses: 0
            });
            
            const embed = generateEmbed({
                title: '🔗 Invite Created',
                description: `[\`${invite.code}\`](https://discord.gg/${invite.code})`,
                fields: [
                    { name: 'Channel', value: channel.name, inline: true },
                    { name: 'Expires', value: '24 hours', inline: true },
                    { name: 'Uses', value: 'Unlimited', inline: true }
                ],
                timestamp: true
            });
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply({ embeds: [errorEmbed('Failed to create invite.')] });
        }
    }
};