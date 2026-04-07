const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'tempmute',
    aliases: ['tmute'],
    category: 'moderation',
    description: 'Temporarily mute a user',
    usage: '<user> <duration> [reason]',
    cooldown: 5,
    requiredPermissions: ['MuteMembers'],
    async execute(message, args, client) {
        const member = message.mentions.members.first();
        
        if (!member) {
            return message.reply({ embeds: [errorEmbed('Please mention a user to mute.')] });
        }
        
        const duration = parseDuration(args[1]);
        
        if (!duration) {
            return message.reply({ embeds: [errorEmbed('Invalid duration. Use format: 1s, 1m, 1h, 1d')] });
        }
        
        const reason = args.slice(2).join(' ') || 'No reason provided';
        
        await member.timeout(duration, reason);
        
        const embed = generateEmbed({
            title: '🔇 User Temp Muted',
            description: `${member.user.tag} muted for ${formatDuration(duration)}`,
            color: client.config.warnColor,
            fields: [{ name: 'Reason', value: reason, inline: false }],
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
        
        setTimeout(async () => {
            try {
                await member.timeout(null);
            } catch (e) {}
        }, duration);
    }
};

function parseDuration(str) {
    const regex = /(\d+)([dhms])/gi;
    let total = 0;
    let match;
    while ((match = regex.exec(str)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        switch (unit) {
            case 'd': total += value * 86400000; break;
            case 'h': total += value * 3600000; break;
            case 'm': total += value * 60000; break;
            case 's': total += value * 1000; break;
        }
    }
    return total;
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}