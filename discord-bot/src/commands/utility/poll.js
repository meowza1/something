const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'poll',
    aliases: ['vote', 'survey'],
    category: 'utility',
    description: 'Create a poll',
    usage: '<question> | <option1> | <option2> | [options...]',
    cooldown: 5,
    async execute(message, args, client) {
        const content = args.join(' ').split('|');
        
        if (content.length < 3) {
            return message.reply({ embeds: [errorEmbed('Usage: !poll <question> | <option1> | <option2> | [options...]')] });
        }
        
        const question = content[0].trim();
        const options = content.slice(1).map(o => o.trim()).filter(o => o);
        
        if (options.length < 2) {
            return message.reply({ embeds: [errorEmbed('Please provide at least 2 options.')] });
        }
        
        if (options.length > 10) {
            return message.reply({ embeds: [errorEmbed('Maximum 10 options allowed.')] });
        }
        
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        
        const embed = generateEmbed({
            title: '📊 Poll',
            description: question,
            color: client.config.embedColor,
            fields: options.map((opt, i) => ({ name: `${emojis[i]} ${opt}`, value: '0 votes', inline: true })),
            footer: `Poll by ${message.author.tag}`,
            timestamp: true
        });
        
        const pollMsg = await message.reply({ embeds: [embed] });
        
        for (let i = 0; i < options.length; i++) {
            await pollMsg.react(emojis[i]);
        }
        
        if (client.db) {
            const insert = client.db.prepare('INSERT INTO polls (guild_id, channel_id, message_id, question, options) VALUES (?, ?, ?, ?, ?)');
            insert.run(message.guild.id, message.channel.id, pollMsg.id, question, JSON.stringify(options));
        }
    }
};