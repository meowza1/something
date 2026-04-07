const { generateEmbed, successEmbed } = require('../../utils/embedGenerator');

module.exports = {
    name: 'dashboard',
    aliases: ['dash'],
    category: 'admin',
    description: 'Start the bot dashboard',
    usage: '[port]',
    cooldown: 10,
    async execute(message, args, client) {
        const port = parseInt(args[0]) || 3000;
        
        if (client.dashboardStarted) {
            return message.reply('Dashboard is already running!');
        }
        
        try {
            const { startDashboard } = require('../../modules/dashboard');
            startDashboard(client, port);
            client.dashboardStarted = true;
            
            message.reply({ embeds: [successEmbed(`Dashboard started on http://localhost:${port}`)] });
        } catch (error) {
            message.reply('Failed to start dashboard: ' + error.message);
        }
    }
};