const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'remind',
    aliases: ['reminder', 'remindme', 'timer'],
    category: 'utility',
    description: 'Set a reminder',
    usage: '<time> <message>',
    cooldown: 3,
    async execute(message, args, client) {
        const timeArg = args[0];
        const reminderText = args.slice(1).join(' ');
        
        if (!timeArg || !reminderText) {
            return message.reply({ embeds: [errorEmbed('Usage: !remind <time> <message>\nExample: !remind 1h30m Do homework')] });
        }
        
        const duration = parseDuration(timeArg);
        
        if (!duration || duration <= 0 || duration > 604800000) {
            return message.reply({ embeds: [errorEmbed('Invalid duration. Max 7 days. Use format: 1s, 1m, 1h, 1d')] });
        }
        
        if (client.db) {
            const insert = client.db.prepare('INSERT INTO reminders (user_id, guild_id, channel_id, message, remind_at) VALUES (?, ?, ?, ?, ?)');
            const remindAt = new Date(Date.now() + duration).toISOString();
            insert.run(message.author.id, message.guild.id, message.channel.id, reminderText, remindAt);
        }
        
        const embed = generateEmbed({
            title: '⏰ Reminder Set',
            description: `I'll remind you in ${formatDuration(duration)}`,
            fields: [{ name: 'Reminder', value: reminderText, inline: false }],
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
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