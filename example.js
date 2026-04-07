const Selfbot = require('./index');

// Replace with your user token (NOT a bot token)
// WARNING: Using selfbots violates Discord's Terms of Service
const TOKEN = 'YOUR_USER_TOKEN_HERE';

const selfbot = new Selfbot(TOKEN);

// Event listeners
selfbot.on('ready', () => {
  console.log('Selfbot is ready!');
});

selfbot.on('message', (message) => {
  // Auto-react to messages containing "hello"
  if (message.content.toLowerCase().includes('hello')) {
    selfbot.addReaction(message.channel_id, message.id, '👍')
      .then(() => console.log('Added reaction'))
      .catch(console.error);
  }
  
  // Auto-delete messages containing "delete me"
  if (message.content.toLowerCase() === 'delete me') {
    selfbot.deleteMessage(message.channel_id, message.id)
      .then(() => console.log('Deleted message'))
      .catch(console.error);
  }
});

selfbot.on('error', (error) => {
  console.error('Selfbot error:', error);
});

// Login
selfbot.login()
  .then(() => {
    console.log('Login successful');
    
    // Example: Send a message after 5 seconds
    setTimeout(async () => {
      try {
        const sentMessage = await selfbot.sendMessage('CHANNEL_ID_HERE', 'Hello from selfbot!');
        console.log('Sent message:', sentMessage.id);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }, 5000);
  })
  .catch(console.error);