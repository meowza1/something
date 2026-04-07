const { generateEmbed, errorEmbed, successEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'automod',
    aliases: ['amod'],
    category: 'moderation',
    description: 'Configure automod settings',
    usage: '<enable|disable|config> [options]',
    cooldown: 5,
    requiredPermissions: ['ManageGuild'],
    async execute(message, args, client) {
        const action = args[0];
        
        if (!action) {
            const config = client.getAutomodConfig(message.guild.id);
            const embed = generateEmbed({
                title: 'AutoMod Configuration',
                color: client.config.embedColor,
                fields: [
                    { name: 'Enabled', value: config.enabled ? '✅ Yes' : '❌ No', inline: true },
                    { name: 'Links', value: config.links ? '✅' : '❌', inline: true },
                    { name: 'Caps', value: config.caps ? '✅' : '❌', inline: true },
                    { name: 'Spam', value: config.spam ? '✅' : '❌', inline: true },
                    { name: 'Bad Words', value: config.words ? '✅' : '❌', inline: true },
                    { name: 'Invites', value: config.invite ? '✅' : '❌', inline: true },
                    { name: 'Emoji Spam', value: config.emoji ? '✅' : '❌', inline: true },
                    { name: 'Caps Threshold', value: `${config.capsThreshold}%`, inline: true },
                    { name: 'Max Emojis', value: `${config.maxEmoji}`, inline: true }
                ],
                footer: 'Use automod enable/disable/config <option>'
            });
            return message.reply({ embeds: [embed] });
        }
        
        if (action === 'enable') {
            client.setAutomodConfig(message.guild.id, { ...client.getAutomodConfig(message.guild.id), enabled: true });
            return message.reply({ embeds: [successEmbed('AutoMod enabled!')] });
        }
        
        if (action === 'disable') {
            client.setAutomodConfig(message.guild.id, { ...client.getAutomodConfig(message.guild.id), enabled: false });
            return message.reply({ embeds: [successEmbed('AutoMod disabled!')] });
        }
        
        if (action === 'config' || action === 'set') {
            const option = args[1];
            const value = args[2];
            
            if (!option || !value) {
                return message.reply({ embeds: [errorEmbed('Usage: automod config <option> <value>\nOptions: links, caps, spam, words, invite, emoji, capsthreshold, maxemoji')] });
            }
            
            const config = client.getAutomodConfig(message.guild.id);
            
            switch (option.toLowerCase()) {
                case 'links':
                    config.links = value === 'on' || value === 'true';
                    break;
                case 'caps':
                    config.caps = value === 'on' || value === 'true';
                    break;
                case 'spam':
                    config.spam = value === 'on' || value === 'true';
                    break;
                case 'words':
                    config.words = value === 'on' || value === 'true';
                    break;
                case 'invite':
                    config.invite = value === 'on' || value === 'true';
                    break;
                case 'emoji':
                    config.emoji = value === 'on' || value === 'true';
                    break;
                case 'capsthreshold':
                case 'threshold':
                    config.capsThreshold = parseInt(value);
                    break;
                case 'maxemoji':
                case 'maxemojis':
                    config.maxEmoji = parseInt(value);
                    break;
                default:
                    return message.reply({ embeds: [errorEmbed('Invalid option.')] });
            }
            
            client.setAutomodConfig(message.guild.id, config);
            return message.reply({ embeds: [successEmbed(`AutoMod ${option} set to ${value}`)] });
        }
        
        message.reply({ embeds: [errorEmbed('Use: automod enable, disable, or config')] });
    }
};