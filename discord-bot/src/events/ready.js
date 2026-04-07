module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`[CLIENT] ${client.user.tag} is ready!`);
        console.log(`[CLIENT] Serving ${client.guilds.cache.size} guilds`);
        
        if (client.ws) {
            console.log(`[CLIENT] WebSocket status: connected`);
        }
        
        client.user.setStatus('online');
    }
};