const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');
const https = require('https');
const http = require('http');

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function extractText(html) {
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    text = text.replace(/<[^>]+>/g, ' ');
    text = text.replace(/\s+/g, ' ').trim();
    return text.slice(0, 3500);
}

module.exports = {
    name: 'scrape',
    aliases: ['extract', 'fetch'],
    category: 'utility',
    description: 'Scrape content from a webpage',
    usage: '<url>',
    cooldown: 15,
    async execute(message, args, client) {
        const url = args[0];
        
        if (!url) {
            return message.reply({ embeds: [errorEmbed('Please provide a URL to scrape.')] });
        }
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return message.reply({ embeds: [errorEmbed('Please provide a valid URL starting with http:// or https://')] });
        }
        
        const loading = await message.reply('Scraping website...');
        
        try {
            const html = await fetchUrl(url);
            const text = extractText(html);
            
            if (text.length < 50) {
                return loading.edit({ embeds: [errorEmbed('Could not extract content from this page.')] });
            }
            
            const embed = generateEmbed({
                title: `🌐 ${new URL(url).hostname}`,
                description: text + (text.length >= 3500 ? '\n\n*[Truncated]*' : ''),
                color: client.config.embedColor,
                fields: [{ name: 'Source', value: url, inline: false }],
                timestamp: true
            });
            
            loading.edit({ embeds: [embed] });
        } catch (error) {
            loading.edit({ embeds: [errorEmbed('Failed to scrape website. The site may be blocking requests.')] });
        }
    }
};