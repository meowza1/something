const { createServer } = require('http');
const { generateEmbed } = require('../utils/embedGenerator');

function startDashboard(client, port = 3000) {
    const server = createServer((req, res) => {
        res.setHeader('Content-Type', 'text/html');
        
        const guildCount = client.guilds.cache.size;
        const channelCount = client.channels.cache.size;
        const userCount = client.users.cache.size;
        const commandCount = client.commands.size;
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Apex Bot Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', sans-serif; 
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            color: white;
            padding: 40px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { 
            text-align: center; 
            font-size: 48px;
            margin-bottom: 10px;
            background: linear-gradient(90deg, #FF6B6B, #4ECDC4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .tagline { text-align: center; color: #888; margin-bottom: 40px; }
        .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: rgba(255,255,255,0.05);
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.1);
            transition: transform 0.3s;
        }
        .stat-card:hover { transform: translateY(-5px); }
        .stat-value { font-size: 48px; font-weight: bold; margin-bottom: 10px; }
        .stat-label { color: #888; text-transform: uppercase; letter-spacing: 2px; }
        .servers { margin-top: 40px; }
        .server {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .server-name { font-weight: bold; }
        .server-members { color: #888; }
        .footer { text-align: center; margin-top: 40px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Apex Bot</h1>
        <p class="tagline">Advanced Discord Bot Dashboard</p>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value" style="color: #FF6B6B">${guildCount}</div>
                <div class="stat-label">Servers</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #4ECDC4">${channelCount}</div>
                <div class="stat-label">Channels</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #9B59B6">${userCount}</div>
                <div class="stat-label">Cached Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #F1C40F">${commandCount}</div>
                <div class="stat-label">Commands</div>
            </div>
        </div>
        
        <div class="servers">
            <h2>Connected Servers</h2>
            ${client.guilds.cache.map(g => `
                <div class="server">
                    <span class="server-name">${g.name}</span>
                    <span class="server-members">${g.memberCount} members</span>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            Apex Bot Dashboard | Running on Node.js
        </div>
    </div>
</body>
</html>`;
        
        res.end(html);
    });
    
    server.listen(port, () => {
        console.log(`[DASHBOARD] Dashboard running on http://localhost:${port}`);
    });
    
    return server;
}

module.exports = { startDashboard };