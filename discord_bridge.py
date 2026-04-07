import discord
import subprocess
import os
import sys
import asyncio

TOKEN = os.getenv('DISCORD_TOKEN')
if not TOKEN:
    print("Error: DISCORD_TOKEN environment variable not set")
    sys.exit(1)

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

client = discord.Client(intents=intents)

active_user_lock = None

@client.event
async def on_ready():
    print(f'We have logged in as {client.user}')

@client.event
async def on_message(message):
    # Ignore messages from the bot itself
    if message.author == client.user:
        return

    # Check if the bot is mentioned
    if client.user in message.mentions:
        # Remove the bot's mention from the content
        mention = f'<@{client.user.id}>'
        mention_nick = f'<@!{client.user.id}>'
        content = message.content.replace(mention, '').replace(mention_nick, '').strip()
        
        # If no message content after mention, do nothing (counts as no one chatted)
        if not content:
            return
        
        # Check if this user already has an active session
        if active_user_lock is not None and active_user_lock != message.author.id:
            return
        
        active_user_lock = message.author.id

        async with message.channel.typing():
            try:
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None,
                    lambda: subprocess.run(
                        ['kilo', 'run', content],
                        capture_output=True,
                        text=True,
                        timeout=120
                    )
                )
                output = result.stdout.strip()
                if result.stderr:
                    output += "\nStderr: " + result.stderr.strip()
                if not output:
                    output = "No output produced"
            except subprocess.TimeoutExpired:
                output = "Request timed out after 120 seconds"
            except FileNotFoundError:
                output = "Error: kilo command not found"
            except Exception as e:
                output = f"Error: {str(e)}"

        for chunk in [output[i:i+1990] for i in range(0, len(output), 1990)]:
            await message.channel.send(chunk)

        active_user_lock = None

client.run(TOKEN)