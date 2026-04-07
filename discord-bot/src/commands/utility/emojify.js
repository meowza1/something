const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'emojify',
    category: 'utility',
    description: 'Convert text to emojis',
    usage: '<text>',
    cooldown: 5,
    async execute(message, args, client) {
        const text = args.join(' ').toLowerCase();
        
        if (!text) {
            return message.reply({ embeds: [errorEmbed('Please provide text to emojify.')] });
        }
        
        const emojiMap = {
            a: '🅰️', b: '🅱️', c: '©️', d: '🅱️', e: '📧', f: '🍟', g: '♉️', h: '♓️', i: 'ℹ️', j: '🉊', k: '🅰️', l: '1️⃣', m: 'Ⓜ️', n: '♑️', o: '🅾️', p: '🅿️', q: '🆑', r: '®️', s: '💮', t: '✝️', u: '⛎', v: '♈️', w: '⚠️', x: '❌', y: '✴️', z: '⚡️',
            0: '0️⃣', 1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣', 6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣'
        };
        
        let result = '';
        for (const char of text) {
            if (emojiMap[char]) {
                result += emojiMap[char] + ' ';
            } else if (char >= 'a' && char <= 'z') {
                result += char + ' ';
            } else {
                result += char + ' ';
            }
        }
        
        message.reply(result.slice(0, 2000));
    }
};