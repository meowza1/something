const { generateEmbed } = require('../../utils/embedGenerator');
const { formatDuration } = require('../../utils/formatDuration');

module.exports = {
    name: 'role',
    aliases: ['roles'],
    category: 'information',
    description: 'List all roles in the server',
    cooldown: 5,
    async execute(message, args, client) {
        const roles = message.guild.roles.cache.sort((a, b) => b.position - a.position);
        
        const roleChunks = roles.map(r => r).filter(r => r.name !== '@everyone').reduce((acc, role, i) => {
            const chunkIndex = Math.floor(i / 20);
            if (!acc[chunkIndex]) acc[chunkIndex] = [];
            acc[chunkIndex].push(role);
            return acc;
        }, []);
        
        const pages = roleChunks.map((chunk, i) => {
            const embed = generateEmbed({
                title: `📋 Server Roles (Page ${i + 1}/${roleChunks.length})`,
                color: client.config.embedColor,
                fields: [{
                    name: 'Roles',
                    value: chunk.map(r => `${r} (${r.members.size})`).join('\n') || 'No roles',
                    inline: false
                }],
                footer: `Total: ${roles.size - 1} roles`
            });
            return embed;
        });
        
        if (pages.length === 1) {
            return message.reply({ embeds: [pages[0]] });
        }
        
        const { pagination } = require('../../utils/pagination');
        pagination(client, message, pages);
    }
};