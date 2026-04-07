const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');
const { ChannelType } = require('discord.js');

module.exports = {
    name: 'createchannel',
    aliases: ['cch', 'newchannel'],
    category: 'moderation',
    description: 'Create a new channel',
    usage: '<name> [type:text/voice]',
    cooldown: 10,
    requiredPermissions: ['ManageChannels'],
    async execute(message, args, client) {
        const name = args[0];
        const type = args[1]?.toLowerCase() === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText;
        
        if (!name) {
            return message.reply({ embeds: [errorEmbed('Please provide a channel name.')] });
        }
        
        const channel = await message.guild.channels.create({
            name: name,
            type: type
        });
        
        message.reply({ embeds: [successEmbed(`Created channel: ${channel}`)] });
    }
};