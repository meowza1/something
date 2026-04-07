module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;
        
        if (!client.db) return;
        
        const afk = client.db.prepare('SELECT * FROM afk WHERE user_id = ? AND guild_id = ?').get(message.author.id, message.guild.id);
        
        if (afk) {
            client.db.prepare('DELETE FROM afk WHERE user_id = ? AND guild_id = ?').run(message.author.id, message.guild.id);
            
            message.reply(`Welcome back! You were AFK: ${afk.message}`);
        }
        
        if (message.mentions.users.size > 0) {
            for (const user of message.mentions.users.values()) {
                const mentionedAfk = client.db.prepare('SELECT * FROM afk WHERE user_id = ? AND guild_id = ?').get(user.id, message.guild.id);
                
                if (mentionedAfk) {
                    message.reply(`${user.tag} is AFK: ${mentionedAfk.message}`);
                }
            }
        }
    });
};