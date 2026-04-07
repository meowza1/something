const fs = require('fs').promises;
const path = require('path');

async function LoadEvents(client) {
    const eventsDir = path.join(__dirname, '../events');
    
    try {
        const eventFiles = await fs.readdir(eventsDir);
        
        for (const file of eventFiles) {
            if (!file.endsWith('.js')) continue;
            
            try {
                const event = require(eventsDir + '/' + file);
                
                if (!event.name || !event.execute) {
                    console.log(`[WARN] Event ${file} missing name or execute function`);
                    continue;
                }
                
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(client, ...args));
                } else {
                    client.on(event.name, (...args) => event.execute(client, ...args));
                }
                
                console.log(`[LOAD] Loaded event: ${event.name}`);
            } catch (error) {
                console.error(`[ERROR] Failed to load event ${file}:`, error);
            }
        }
        
        console.log(`[LOAD] Total events loaded: ${eventFiles.filter(f => f.endsWith('.js')).length}`);
    } catch (error) {
        console.error('[ERROR] Failed to load events:', error);
    }
}

module.exports = { LoadEvents };