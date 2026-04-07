const { Collection } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

async function LoadCommands(client) {
    const commandsDir = path.join(__dirname, '../commands');
    
    try {
        const categories = await fs.readdir(commandsDir);
        
        for (const category of categories) {
            const categoryPath = path.join(commandsDir, category);
            const stat = await fs.stat(categoryPath);
            
            if (!stat.isDirectory()) continue;
            
            client.categories.add(category);
            
            const commandFiles = await fs.readdir(categoryPath);
            
            for (const file of commandFiles) {
                if (!file.endsWith('.js')) continue;
                
                try {
                    const command = require(categoryPath + '/' + file);
                    
                    if (!command.name || !command.execute && !command.slashExecute) {
                        console.log(`[WARN] Command ${file} missing name or execute function`);
                        continue;
                    }
                    
                    client.commands.set(command.name, command);
                    
                    if (command.aliases && Array.isArray(command.aliases)) {
                        for (const alias of command.aliases) {
                            client.aliases.set(alias, command.name);
                        }
                    }
                    
                    if (command.category !== category) {
                        command.category = category;
                    }
                    
                    console.log(`[LOAD] Loaded ${category}/${command.name}`);
                } catch (error) {
                    console.error(`[ERROR] Failed to load command ${file}:`, error);
                }
            }
        }
        
        console.log(`[LOAD] Total commands loaded: ${client.commands.size}`);
    } catch (error) {
        console.error('[ERROR] Failed to load commands:', error);
    }
}

async function LoadSlashCommands(client) {
    const slashCommands = new Collection();
    const commandsDir = path.join(__dirname, '../commands');
    
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
                
                if (command.slashCommand) {
                    const slashData = typeof command.slashCommand === 'function' 
                        ? command.slashCommand() 
                        : command.slashCommand;
                    
                    slashCommands.set(command.name, {
                        ...slashData,
                        execute: command.slashExecute || command.execute
                    });
                }
            } catch (error) {
                console.error(`[ERROR] Failed to load slash command ${file}:`, error);
            }
        }
    }
    
    return slashCommands;
}

module.exports = { LoadCommands, LoadSlashCommands };