# Discord Selfbot

A selfbot framework for Discord similar to discord.js but designed for user accounts. This allows users to run commands on their own Discord client without requiring a bot account.

## ⚠️ WARNING

Using selfbots violates Discord's Terms of Service and may result in account termination. Use at your own risk. This library is provided for educational purposes only.

## Installation

```bash
npm install discord-selfbot
```

Or if you have cloned this repository:

```bash
npm install
```

## Usage

```javascript
const Selfbot = require('discord-selfbot');

// Replace with your user token (NOT a bot token)
// You can get this from Discord's developer tools or by logging in via the web client
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
  })
  .catch(console.error);
```

## API

### Constructor

```javascript
new Selfbot(token)
```
Creates a new selfbot instance.
- `token`: Your Discord user token

### Events

The selfbot emits various Discord gateway events:
- `ready`: When the selfbot has successfully connected and identified
- `message`: When a message is created
- `messageUpdate`: When a message is updated
- `messageDelete`: When a message is deleted
- `messageReactionAdd`: When a reaction is added to a message
- `messageReactionRemove`: When a reaction is removed from a message
- `disconnect`: When the connection to Discord is lost
- `error`: When an error occurs

### Methods

#### `login()`
Connects to Discord and logs in. Returns a Promise that resolves when the selfbot is ready.

#### `sendMessage(channelId, content)`
Sends a message to a channel.
- `channelId`: The ID of the channel to send to
- `content`: The message content
- Returns a Promise that resolves with the sent message object

#### `deleteMessage(channelId, messageId)`
Deletes a message.
- `channelId`: The ID of the channel containing the message
- `messageId`: The ID of the message to delete
- Returns a Promise that resolves when the message is deleted

#### `addReaction(channelId, messageId, emoji)`
Adds a reaction to a message.
- `channelId`: The ID of the channel containing the message
- `messageId`: The ID of the message to react to
- `emoji`: The emoji to react with (can be unicode or custom emoji ID:Name)
- Returns a Promise that resolves when the reaction is added

#### `removeReaction(channelId, messageId, emoji)`
Removes a reaction from a message.
- `channelId`: The ID of the channel containing the message
- `messageId`: The ID of the message to remove the reaction from
- `emoji`: The emoji to remove
- Returns a Promise that resolves when the reaction is removed

#### `editMessage(channelId, messageId, content)`
Edits a message.
- `channelId`: The ID of the channel containing the message
- `messageId`: The ID of the message to edit
- `content`: The new message content
- Returns a Promise that resolves with the edited message object

#### `getMessage(channelId, messageId)`
Gets a message by ID.
- `channelId`: The ID of the channel containing the message
- `messageId`: The ID of the message to get
- Returns a Promise that resolves with the message object

#### `on(event, callback)`
Registers an event listener.
- `event`: The event name
- `callback`: The function to call when the event is emitted

#### `once(event, callback)`
Registers a one-time event listener.
- `event`: The event name
- `callback`: The function to call when the event is emitted

#### `off(event, callback)`
Removes an event listener.
- `event`: The event name
- `callback`: The function to remove

## Example Features

See `example.js` for more advanced usage including:
- Automatic message reactions
- Auto-deletion of specific messages
- Sending messages after login
- Error handling

## Building from Source

If you want to build or modify the selfbot yourself:

```bash
# Install dependencies
npm install

# Run the example
npm start
```

## License

MIT

## Disclaimer

This software is provided "as is", without warranty of any kind. The authors are not responsible for any misuse of this software or any consequences resulting from its use, including but not limited to account termination by Discord.