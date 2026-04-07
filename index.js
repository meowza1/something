const WebSocket = require('ws');
const fetch = require('node-fetch');

// Discord Gateway URL
const GATEWAY_URL = 'wss://gateway.discord.gg/?v=9&encoding=json';
const API_URL = 'https://discord.com/api/v9';

class Selfbot {
  constructor(token) {
    this.token = token;
    this.ws = null;
    this.sequence = null;
    this.sessionId = null;
    this.user = null;
    this.ready = false;
    this.eventHandlers = {};
  }

  // Connect to Discord gateway
  async connect() {
    this.ws = new WebSocket(GATEWAY_URL);
    
    this.ws.on('open', () => {
      console.log('Connected to Discord gateway');
    });

    this.ws.on('message', async (data) => {
      const packet = JSON.parse(data);
      
      // Handle sequence numbers for heartbeat
      if (packet.s !== undefined) {
        this.sequence = packet.s;
      }

      switch (packet.t) {
        case 'READY':
          this.sessionId = packet.d.session_id;
          this.user = packet.d.user;
          this.ready = true;
          console.log(`Logged in as ${this.user.username}#${this.user.discriminator}`);
          this.emit('ready');
          break;
          
        case 'MESSAGE_CREATE':
          this.emit('message', packet.d);
          break;
          
        case 'MESSAGE_UPDATE':
          this.emit('messageUpdate', packet.d);
          break;
          
        case 'MESSAGE_DELETE':
          this.emit('messageDelete', packet.d);
          break;
          
        case 'MESSAGE_REACTION_ADD':
          this.emit('messageReactionAdd', packet.d);
          break;
          
        case 'MESSAGE_REACTION_REMOVE':
          this.emit('messageReactionRemove', packet.d);
          break;
          
        case 'RESUMED':
          console.log('Resumed session');
          this.ready = true;
          this.emit('ready');
          break;
      }
    });

    this.ws.on('close', () => {
      console.log('Disconnected from Discord gateway');
      this.ready = false;
      this.emit('disconnect');
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });

    // Wait for connection to open
    return new Promise((resolve) => {
      this.ws.on('open', resolve);
    });
  }

  // Send a packet to the gateway
  send(op, data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }
    
    const packet = {
      op: op,
      d: data
    };
    
    if (this.sequence !== null) {
      packet.s = this.sequence;
    }
    
    this.ws.send(JSON.stringify(packet));
  }

  // Identify with the gateway
  async identify() {
    this.send(2, {
      token: this.token,
      properties: {
        $os: 'Windows',
        $browser: 'Discord Selfbot',
        $device: 'Discord Selfbot'
      },
      compress: false,
      large_threshold: 250
    });
  }

  // Heartbeat to keep connection alive
  startHeartbeat(interval) {
    setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      this.send(1, this.sequence);
    }, interval);
  }

  // Login and start the selfbot
  async login() {
    await this.connect();
    
    // Wait for READY event before identifying
    return new Promise((resolve) => {
      this.once('ready', () => {
        this.identify();
        resolve();
      });
    });
  }

  // Send a message to a channel
  async sendMessage(channelId, content) {
    if (!this.ready) {
      throw new Error('Selfbot is not ready');
    }
    
    const response = await fetch(`${API_URL}/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': this.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Delete a message
  async deleteMessage(channelId, messageId) {
    if (!this.ready) {
      throw new Error('Selfbot is not ready');
    }
    
    const response = await fetch(`${API_URL}/channels/${channelId}/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.token
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete message: ${response.statusText}`);
    }
    
    return true;
  }

  // Add a reaction to a message
  async addReaction(channelId, messageId, emoji) {
    if (!this.ready) {
      throw new Error('Selfbot is not ready');
    }
    
    const response = await fetch(`${API_URL}/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/@me`, {
      method: 'PUT',
      headers: {
        'Authorization': this.token
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add reaction: ${response.statusText}`);
    }
    
    return true;
  }

  // Remove a reaction from a message
  async removeReaction(channelId, messageId, emoji) {
    if (!this.ready) {
      throw new Error('Selfbot is not ready');
    }
    
    const response = await fetch(`${API_URL}/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/@me`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.token
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to remove reaction: ${response.statusText}`);
    }
    
    return true;
  }

  // Edit a message
  async editMessage(channelId, messageId, content) {
    if (!this.ready) {
      throw new Error('Selfbot is not ready');
    }
    
    const response = await fetch(`${API_URL}/channels/${channelId}/messages/${messageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': this.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to edit message: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Get message by ID
  async getMessage(channelId, messageId) {
    if (!this.ready) {
      throw new Error('Selfbot is not ready');
    }
    
    const response = await fetch(`${API_URL}/channels/${channelId}/messages/${messageId}`, {
      method: 'GET',
      headers: {
        'Authorization': this.token
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get message: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Event handling
  on(event, callback) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(callback);
  }

  once(event, callback) {
    const onceCallback = (...args) => {
      this.off(event, onceCallback);
      callback(...args);
    };
    this.on(event, onceCallback);
  }

  off(event, callback) {
    if (!this.eventHandlers[event]) return;
    this.eventHandlers[event] = this.eventHandlers[event].filter(cb => cb !== callback);
  }

  emit(event, ...args) {
    if (!this.eventHandlers[event]) return;
    this.eventHandlers[event].forEach(callback => callback(...args));
  }
}

module.exports = Selfbot;