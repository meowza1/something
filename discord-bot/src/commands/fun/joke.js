const { generateEmbed, errorEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'joke',
    category: 'fun',
    description: 'Get a random joke',
    cooldown: 5,
    async execute(message, args, client) {
        const jokes = [
            { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!" },
            { setup: "Why did the scarecrow win an award?", punchline: "Because he was outstanding in his field!" },
            { setup: "What do you call a fake noodle?", punchline: "An impasta!" },
            { setup: "Why did the bicycle fall over?", punchline: "Because it was two-tired!" },
            { setup: "What do you call a bear with no teeth?", punchline: "A gummy bear!" },
            { setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up!" },
            { setup: "What do you call a dog that does magic?", punchline: "A Labracadabrador!" },
            { setup: "Why did the math book look so sad?", punchline: "Because it had too many problems!" },
            { setup: "What do you call a sleeping dinosaur?", punchline: "A dino-snore!" },
            { setup: "Why did the coffee file a police report?", punchline: "It got mugged!" }
        ];
        
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        
        const embed = generateEmbed({
            title: '😂 Joke',
            description: `${joke.setup}\n\n**${joke.punchline}**`,
            color: client.config.embedColor,
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};