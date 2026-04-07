const { REST, Routes, Collection } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

async function registerSlashCommands(client) {
    const commands = [];
    const commandsDir = path.join(__dirname, './commands');
    
    try {
        const categories = await fs.readdir(commandsDir);
        
        for (const category of categories) {
            const categoryPath = path.join(commandsDir, category);
            const stat = await fs.stat(categoryPath);
            
            if (!stat.isDirectory()) continue;
            
            const commandFiles = await fs.readdir(categoryPath);
            
            for (const file of commandFiles) {
                if (!file.endsWith('.js')) continue;
                
                try {
                    const command = require(categoryPath + '/' + file);
                    
                    if (!command.name) continue;
                    
                    const slashData = {
                        name: command.name,
                        description: command.description || 'No description',
                        type: 1
                    };
                    
                    if (command.options) {
                        slashData.options = command.options;
                    } else if (command.usage) {
                        const usageParts = command.usage.split(' ');
                        const options = [];
                        
                        for (const part of usageParts) {
                            if (part.startsWith('<')) {
                                const name = part.replace(/[<>]/g, '');
                                options.push({
                                    name,
                                    description: `${name} parameter`,
                                    type: 3,
                                    required: true
                                });
                            } else if (part.startsWith('[')) {
                                const name = part.replace(/[\[\]]/g, '');
                                options.push({
                                    name,
                                    description: `${name} parameter`,
                                    type: 3,
                                    required: false
                                });
                            }
                        }
                        
                        if (options.length > 0) {
                            slashData.options = options;
                        }
                    }
                    
                    commands.push(slashData);
                    client.slashCommands.set(command.name, command);
                } catch (error) {
                    console.error(`[ERROR] Failed to process slash command ${file}:`, error);
                }
            }
        }
        
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
        
        try {
            console.log('[SLASH] Registering ' + commands.length + ' slash commands...');
            
            if (process.env.DEV_GUILD_ID) {
                await rest.put(
                    Routes.applicationGuildCommands(client.user.id, process.env.DEV_GUILD_ID),
                    { body: commands }
                );
                console.log('[SLASH] Registered guild commands');
            } else {
                await rest.put(
                    Routes.applicationCommands(client.user.id),
                    { body: commands }
                );
                console.log('[SLASH] Registered global commands');
            }
        } catch (error) {
            console.error('[SLASH ERROR]', error);
        }
        
        return commands;
    } catch (error) {
        console.error('[ERROR] Failed to register slash commands:', error);
        return [];
    }
}

module.exports = { registerSlashCommands };