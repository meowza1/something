module.exports = {
    name: 'messageCreate',
    execute(client, message) {
        if (message.author.bot) return;
        
        const prefix = client.config.prefix;
        
        if (!message.content.startsWith(prefix)) {
            return;
        }
        
        const args = message.content.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();
        
        let command = client.commands.get(commandName);
        
        if (!command) {
            const alias = client.aliases.get(commandName);
            if (alias) {
                command = client.commands.get(alias);
            }
        }
        
        if (!command) return;
        
        if (command.cooldown) {
            const cooldownKey = `${command.name}-${message.author.id}`;
            const now = Date.now();
            
            if (client.cooldowns.has(cooldownKey)) {
                const cooldownEnd = client.cooldowns.get(cooldownKey);
                if (now < cooldownEnd) {
                    const timeLeft = (cooldownEnd - now) / 1000;
                    return message.reply(`Please wait ${timeLeft.toFixed(1)}s before using this command again.`);
                }
            }
            
            client.cooldowns.set(cooldownKey, now + (command.cooldown * 1000));
            setTimeout(() => client.cooldowns.delete(cooldownKey), command.cooldown * 1000);
        }
        
        if (command.requiredPermissions) {
            const missing = [];
            for (const perm of command.requiredPermissions) {
                if (!message.member.permissions.has(perm)) {
                    missing.push(perm);
                }
            }
            if (missing.length > 0) {
                return message.reply(`You need the following permissions: ${missing.join(', ')}`);
            }
        }
        
        try {
            command.execute(message, args, client);
            
            if (client.db) {
                const insertCmd = client.db.prepare(
                    'INSERT INTO command_usage (command, user_id, guild_id) VALUES (?, ?, ?)'
                );
                insertCmd.run(command.name, message.author.id, message.guild?.id);
            }
        } catch (error) {
            console.error('[COMMAND ERROR]', error);
            message.reply('An error occurred while executing this command.');
        }
    }
};