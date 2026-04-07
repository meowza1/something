const { generateEmbed } = require('../../utils/embedGenerator');

const quotes = [
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { quote: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
    { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { quote: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
    { quote: "Two things are infinite: the universe and human stupidity.", author: "Albert Einstein" },
    { quote: "The only thing we have to fear is fear itself.", author: "Franklin D. Roosevelt" },
    { quote: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", author: "Ralph Waldo Emerson" },
    { quote: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" }
];

module.exports = {
    name: 'quote',
    aliases: ['quotes'],
    category: 'fun',
    description: 'Get a random quote',
    cooldown: 5,
    async execute(message, args, client) {
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        
        const embed = generateEmbed({
            title: '💬 Quote',
            description: `"${quote.quote}"`,
            color: client.config.embedColor,
            fields: [{ name: 'Author', value: quote.author, inline: true }],
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};