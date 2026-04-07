const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'fact',
    category: 'fun',
    description: 'Get a random fact',
    cooldown: 5,
    async execute(message, args, client) {
        const facts = [
            "Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible.",
            "Octopuses have three hearts and blue blood.",
            "Bananas are berries, but strawberries aren't.",
            "A day on Venus is longer than a year on Venus.",
            "The shortest war in history lasted 38-45 minutes between Britain and Zanzibar in 1896.",
            "There are more stars than grains of sand on all Earth's beaches.",
            "The oldest known living organism is a 43,000-year-old bacteria.",
            "A group of flamingos is called a 'flamboyance'.",
            "Sloths can hold their breath longer than dolphins (up to 40 minutes).",
            "The world's oldest known joke is from 1900 BC - a Sumerian proverb."
        ];
        
        const fact = facts[Math.floor(Math.random() * facts.length)];
        
        const embed = generateEmbed({
            title: '💡 Did You Know?',
            description: fact,
            color: client.config.embedColor,
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};