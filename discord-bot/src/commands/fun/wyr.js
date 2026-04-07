const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'wyr',
    aliases: ['wouldyourather', 'rather'],
    category: 'fun',
    description: 'Would you rather...',
    cooldown: 5,
    async execute(message, args, client) {
        const questions = [
            'Would you rather have infinite money or infinite time?',
            'Would you rather be able to fly or be invisible?',
            'Would you rather live in the city or countryside?',
            'Would you rather always be 10 minutes late or 20 minutes early?',
            'Would you rather have super strength or super speed?',
            'Would you rather be famous or be the best friend of someone famous?',
            'Would you rather have a rewind button or a pause button in your life?',
            'Would you rather be able to talk to animals or speak all human languages?',
            'Would you rather never use social media again or never watch TV again?',
            'Would you rather explore space or the deep ocean?'
        ];
        
        const question = questions[Math.floor(Math.random() * questions.length)];
        
        const embed = generateEmbed({
            title: '🤔 Would You Rather...',
            description: question,
            color: client.config.embedColor,
            fields: [
                { name: 'Option 1', value: '👍 Vote in poll', inline: true },
                { name: 'Option 2', value: '👎 Vote in poll', inline: true }
            ]
        });
        
        const msg = await message.reply({ embeds: [embed] });
        await msg.react('👍');
        await msg.react('👎');
    }
};