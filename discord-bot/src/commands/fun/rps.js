const { generateEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'rps',
    aliases: ['rockpaperscissors'],
    category: 'fun',
    description: 'Play rock paper scissors',
    usage: '<rock|paper|scissors>',
    cooldown: 5,
    async execute(message, args, client) {
        const choice = args[0]?.toLowerCase();
        const choices = ['rock', 'paper', 'scissors'];
        
        if (!choice || !choices.includes(choice)) {
            return message.reply('Please choose: rock, paper, or scissors');
        }
        
        const botChoice = choices[Math.floor(Math.random() * 3)];
        const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
        
        let result;
        if (choice === botChoice) result = "It's a tie!";
        else if (
            (choice === 'rock' && botChoice === 'scissors') ||
            (choice === 'paper' && botChoice === 'rock') ||
            (choice === 'scissors' && botChoice === 'paper')
        ) result = 'You win!';
        else result = 'You lose!';
        
        const embed = generateEmbed({
            title: '🎮 Rock Paper Scissors',
            description: `${emojis[choice]} vs ${emojis[botChoice]}\n\n**${result}**`,
            color: client.config.embedColor,
            timestamp: true
        });
        
        message.reply({ embeds: [embed] });
    }
};