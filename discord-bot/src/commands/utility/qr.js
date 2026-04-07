const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'qr',
    aliases: ['qrcode'],
    category: 'utility',
    description: 'Generate a QR code',
    usage: '<text>',
    cooldown: 5,
    async execute(message, args, client) {
        const text = args.join(' ');
        
        if (!text) {
            return message.reply({ embeds: [errorEmbed('Please provide text for the QR code.')] });
        }
        
        if (text.length > 1000) {
            return message.reply({ embeds: [errorEmbed('Text is too long (max 1000 characters).')] });
        }
        
        const qr = require('qrcode');
        const dataUrl = await qr.toDataURL(text);
        
        const embed = generateEmbed({
            title: '📱 QR Code',
            image: dataUrl,
            color: client.config.embedColor,
            fields: [{ name: 'Content', value: text.slice(0, 100), inline: false }],
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};