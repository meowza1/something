const { generateEmbed } = require('../utils/embedGenerator');

const automodConfig = new Map();

function getConfig(guildId) {
    if (!automodConfig.has(guildId)) {
        automodConfig.set(guildId, {
            enabled: false,
            links: false,
            caps: false,
            spam: false,
            words: false,
            invite: false,
            emoji: false,
            capsThreshold: 70,
            maxCaps: 10,
            maxEmoji: 5,
            ignoredRoles: [],
            ignoredChannels: [],
            badWords: []
        });
    }
    return automodConfig.get(guildId);
}

module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;
        
        const config = getConfig(message.guild.id);
        if (!config.enabled) return;
        
        if (config.ignoredChannels.includes(message.channel.id)) return;
        if (config.ignoredRoles.some(r => message.member.roles.cache.has(r))) return;
        
        const content = message.content;
        
        if (config.caps) {
            const capsCount = (content.match(/[A-Z]/g) || []).length;
            const letterCount = (content.replace(/[^a-zA-Z]/g, '').length);
            const capsPercent = letterCount > 0 ? (capsCount / letterCount) * 100 : 0;
            
            if (capsPercent > config.capsThreshold && content.length > config.maxCaps) {
                await message.delete();
                try {
                    await message.channel.send({
                        embeds: [generateEmbed({
                            title: 'AutoMod: Caps Detected',
                            description: `${message.author}, please don't spam caps.`,
                            type: 'warning'
                        })]
                    }).then(msg => setTimeout(() => msg.delete(), 3000));
                } catch (e) {}
                return;
            }
        }
        
        if (config.links) {
            const linkRegex = /https?:\/\/[^\s]+/g;
            if (linkRegex.test(content)) {
                await message.delete();
                try {
                    await message.channel.send({
                        embeds: [generateEmbed({
                            title: 'AutoMod: Links Blocked',
                            description: `${message.author}, links are not allowed in this channel.`,
                            type: 'warning'
                        })]
                    }).then(msg => setTimeout(() => msg.delete(), 3000));
                } catch (e) {}
                return;
            }
        }
        
        if (config.invite) {
            const inviteRegex = /(discord\.gg|discordapp\.com\/invite)\/[a-zA-Z0-9]+/gi;
            if (inviteRegex.test(content)) {
                await message.delete();
                try {
                    await message.channel.send({
                        embeds: [generateEmbed({
                            title: 'AutoMod: Invites Blocked',
                            description: `${message.author}, server invites are not allowed.`,
                            type: 'warning'
                        })]
                    }).then(msg => setTimeout(() => msg.delete(), 3000));
                } catch (e) {}
                return;
            }
        }
        
        if (config.words) {
            const hasBadWord = config.badWords.some(word => 
                content.toLowerCase().includes(word.toLowerCase())
            );
            if (hasBadWord) {
                await message.delete();
                try {
                    await message.channel.send({
                        embeds: [generateEmbed({
                            title: 'AutoMod: Blocked Word',
                            description: `${message.author}, that word is not allowed.`,
                            type: 'warning'
                        })]
                    }).then(msg => setTimeout(() => msg.delete(), 3000));
                } catch (e) {}
                return;
            }
        }
        
        if (config.emoji) {
            const emojiCount = (content.match(/<:\w+:\d+>|<a:\w+:\d+>/g) || []).length;
            if (emojiCount > config.maxEmoji) {
                await message.delete();
                try {
                    await message.channel.send({
                        embeds: [generateEmbed({
                            title: 'AutoMod: Too Many Emojis',
                            description: `${message.author}, max ${config.maxEmoji} emojis allowed.`,
                            type: 'warning'
                        })]
                    }).then(msg => setTimeout(() => msg.delete(), 3000));
                } catch (e) {}
                return;
            }
        }
        
        if (config.spam) {
            const spamPatterns = ['aaaaaa', '11111', '!!!!!!!'];
            for (const pattern of spamPatterns) {
                if (content.toLowerCase().includes(pattern)) {
                    await message.delete();
                    try {
                        await message.channel.send({
                            embeds: [generateEmbed({
                                title: 'AutoMod: Spam Detected',
                                description: `${message.author}, no spam allowed.`,
                                type: 'warning'
                            })]
                        }).then(msg => setTimeout(() => msg.delete(), 3000));
                    } catch (e) {}
                    return;
                }
            }
        }
    });
    
    client.getAutomodConfig = getConfig;
    client.setAutomodConfig = (guildId, config) => {
        automodConfig.set(guildId, config);
    };
};