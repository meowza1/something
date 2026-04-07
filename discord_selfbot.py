import os
import sys
import discord
import asyncio
import time
import traceback
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ======================
# CONFIGURATION SECTION
# ======================
TOKEN = os.getenv("DISCORD_TOKEN")
PREFIX = os.getenv("COMMAND_PREFIX", "?")

if not TOKEN:
    print("ERROR: DISCORD_TOKEN not found in .env file.")
    print("Add your user token: DISCORD_TOKEN=your_token_here")
    exit(1)

# Global state
autoreact_state = False
last_command_time = 0
last_autoreact_time = 0
COMMAND_COOLDOWN = 3.0
AUTOREACT_COOLDOWN = 1.0

# Create Discord client
intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True
intents.messages = True
client = discord.Client(intents=intents)


# ======================
# HELPER FUNCTIONS
# ======================
async def rate_limit():
    global last_command_time
    current = time.time()
    if current - last_command_time < COMMAND_COOLDOWN:
        await asyncio.sleep(COMMAND_COOLDOWN - (current - last_command_time))
    last_command_time = time.time()


async def autoreact_rate_limit():
    global last_autoreact_time
    current = time.time()
    if current - last_autoreact_time < AUTOREACT_COOLDOWN:
        await asyncio.sleep(AUTOREACT_COOLDOWN - (current - last_autoreact_time))
    last_autoreact_time = time.time()


def is_owner(message):
    if client.user and message.author:
        return message.author.id == client.user.id
    return False


# ======================
# COMMAND HANDLER
# ======================
async def handle_command(message):
    global PREFIX, autoreact_state

    if not message.content.startswith(PREFIX):
        return

    parts = message.content[len(PREFIX) :].strip().split()
    if not parts:
        return

    command = parts[0].lower()
    args = parts[1:]
    await rate_limit()

    try:
        if command == "purge":
            if not args:
                await message.channel.send(
                    f"Usage: {PREFIX}purge <1-100>", delete_after=5
                )
                return
            try:
                amount = int(args[0])
                if not 1 <= amount <= 100:
                    await message.channel.send("Amount: 1-100", delete_after=5)
                    return
                deleted = await message.channel.purge(limit=amount + 1)
                await message.channel.send(
                    f"Deleted {len(deleted) - 1} msgs", delete_after=5
                )
            except ValueError:
                await message.channel.send("Invalid number", delete_after=5)
            except discord.Forbidden:
                await message.channel.send("No permission", delete_after=5)

        elif command == "autoreact":
            autoreact_state = not autoreact_state
            await message.channel.send(
                f"Autoreact: {'ON' if autoreact_state else 'OFF'}", delete_after=5
            )

        elif command == "ping":
            latency = client.latency * 1000
            await message.channel.send(f"Pong! {latency:.1f}ms", delete_after=5)

        elif command == "setprefix":
            if not is_owner(message):
                await message.channel.send("Owner only", delete_after=5)
                return
            if not args:
                await message.channel.send(f"Prefix: {PREFIX}", delete_after=5)
                return
            PREFIX = args[0]
            await message.channel.send(f"Prefix: {PREFIX}", delete_after=5)

    except discord.HTTPException as e:
        if e.status == 429:
            await asyncio.sleep(5)
    except Exception as e:
        print(f"[ERROR] {e}")


# ======================
# EVENTS
# ======================
@client.event
async def on_ready():
    user = client.user
    print(f"\n{'=' * 50}")
    print(f"Logged in as: {user}")
    if user:
        print(f"User ID: {user.id}")
    print(f"Prefix: {PREFIX}")
    print("SelfBot Ready!")
    print(f"{'=' * 50}\n")


@client.event
async def on_message(message):
    if message.author.bot or message.author == client.user:
        return

    if autoreact_state:
        try:
            await autoreact_rate_limit()
            await message.add_reaction("👍")
        except:
            pass

    await handle_command(message)


@client.event
async def on_error(event, *args, **kwargs):
    print(f"[ERROR] {event}")
    traceback.print_exc()


# ======================
# RUN
# ======================
if __name__ == "__main__":
    print("Discord SelfBot")
    print("===============")
    print(f"Token: ...{TOKEN[-10:]}")
    print(f"Prefix: {PREFIX}")
    print("Starting...\n")
    try:
        client.run(TOKEN)
    except KeyboardInterrupt:
        print("\nStopped")
    except discord.LoginFailure:
        print("\nLogin failed - invalid token (use USER token)")
    except Exception as e:
        print(f"\nError: {e}")
        traceback.print_exc()
