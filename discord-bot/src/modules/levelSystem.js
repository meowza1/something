module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;
        
        if (!client.db) return;
        
        const userData = client.db.prepare('SELECT * FROM users WHERE user_id = ? AND guild_id = ?').get(message.author.id, message.guild.id);
        
        const xpGain = Math.floor(Math.random() * 5) + 1;
        
        if (userData) {
            const newXp = userData.xp + xpGain;
            const xpForLevel = (userData.level + 1) * 100;
            
            let newLevel = userData.level;
            if (newXp >= xpForLevel) {
                newLevel++;
                message.reply(`🎉 Congratulations! You leveled up to level ${newLevel}!`);
            }
            
            client.db.prepare('UPDATE users SET xp = ?, level = ?, messages = messages + 1 WHERE user_id = ? AND guild_id = ?').run(newXp, newLevel, message.author.id, message.guild.id);
        } else {
            client.db.prepare('INSERT INTO users (user_id, guild_id, xp, level, messages) VALUES (?, ?, ?, 1, 1)').run(message.author.id, message.guild.id, xpGain);
        }
    });
};