const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'shorten',
    aliases: ['shorturl', 'tinyurl'],
    category: 'utility',
    description: 'Shorten a URL',
    usage: '<url>',
    cooldown: 10,
    async execute(message, args, client) {
        const url = args[0];
        
        if (!url) {
            return message.reply({ embeds: [errorEmbed('Please provide a URL to shorten.')] });
        }
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return message.reply({ embeds: [errorEmbed('Please provide a valid URL.')] });
        }
        
        try {
            const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
            const shortUrl = await response.text();
            
            const embed = generateEmbed({
                title: '🔗 URL Shortened',
                fields: [
                    { name: 'Original', value: url, inline: false },
                    { name: 'Shortened', value: shortUrl, inline: false }
                ],
                color: client.config.embedColor,
                timestamp: true
            });
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply({ embeds: [errorEmbed('Failed to shorten URL.')] });
        }
    }
};