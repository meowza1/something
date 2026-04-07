const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'giveaway',
    aliases: ['gw', 'gstart'],
    category: 'utility',
    description: 'Start a giveaway',
    usage: '<time> <winners> <prize>',
    cooldown: 10,
    requiredPermissions: ['ManageMessages'],
    async execute(message, args, client) {
        const time = args[0];
        const winners = parseInt(args[1]);
        const prize = args.slice(2).join(' ');
        
        if (!time || !winners || !prize) {
            return message.reply({ embeds: [errorEmbed('Usage: !giveaway <time> <winners> <prize>\nExample: !giveaway 1h 5 Nitro')] });
        }
        
        const duration = parseDuration(time);
        
        if (!duration) {
            return message.reply({ embeds: [errorEmbed('Invalid duration format.')] });
        }
        
        const endsAt = new Date(Date.now() + duration);
        
        const embed = generateEmbed({
            title: '🎉 GIVEAWAY',
            description: prize,
            color: client.config.embedColor,
            fields: [
                { name: 'Ends', value: `<t:${Math.floor(endsAt.getTime() / 1000)}:R>`, inline: true },
                { name: 'Winners', value: winners.toString(), inline: true }
            ],
            footer: 'React 🎉 to enter!',
            timestamp: true
        });
        
        const msg = await message.channel.send({ embeds: [embed] });
        await msg.react('🎉');
        
        if (client.db) {
            const insert = client.db.prepare('INSERT INTO giveaways (guild_id, channel_id, message_id, prize, winners, ends_at) VALUES (?, ?, ?, ?, ?, ?)');
            insert.run(message.guild.id, message.channel.id, msg.id, prize, winners, endsAt.toISOString());
        }
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