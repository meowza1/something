const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'ping',
    aliases: ['latency', 'pong'],
    category: 'information',
    description: 'Check the bot\'s ping and latency',
    cooldown: 3,
    async execute(message, args, client) {
        const wsPing = client.ws.ping;
        const msg = await message.reply('Pinging...');
        const apiPing = msg.createdTimestamp - message.createdTimestamp;
        
        const embed = generateEmbed({
            title: '🏓 Pong!',
            color: wsPing < 100 ? '#00FF00' : wsPing < 300 ? '#FFFF00' : '#FF0000',
            fields: [
                { name: 'API Latency', value: `\`${apiPing}ms\``, inline: true },
                { name: 'WebSocket Latency', value: `\`${wsPing}ms\``, inline: true },
                { name: 'Round Trip', value: `\`${apiPing + wsPing}ms\``, inline: true }
            ],
            timestamp: true
        });
        
        msg.edit({ content: '', embeds: [embed] });
    }
};