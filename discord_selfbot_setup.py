#!/usr/bin/env python3
"""
Discord SelfBot Setup Script
This script will:
1. Check/install required dependencies
2. Ask for Discord user token
3. Ask for command prefix
4. Create/update .env file
5. Run the selfbot
"""

import os
import sys
import subprocess
import ssl


def install_dependencies():
    """Install required Python packages"""
    print("Checking and installing dependencies...")
    try:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "discord.py", "python-dotenv"]
        )
        print("✓ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install dependencies: {e}")
        return False


def get_user_input():
    """Get token and prefix from user"""
    print("\n=== Discord SelfBot Setup ===")

    # Get token
    while True:
        token = input("Enter your Discord user token: ").strip()
        if token:
            break
        print("Token cannot be empty!")

    # Get prefix
    print("Enter command prefix (default: ?): ", end="")
    prefix = input().strip()
    if not prefix:
        prefix = "?"

    return token, prefix


def create_env_file(token, prefix):
    """Create or update .env file"""
    env_content = f"""DISCORD_TOKEN={token}
COMMAND_PREFIX={prefix}
"""

    try:
        with open(".env", "w") as f:
            f.write(env_content)
        print("✓ .env file created/updated successfully")
        return True
    except Exception as e:
        print(f"✗ Failed to create .env file: {e}")
        return False


def check_existing_env():
    """Check if .env file already exists"""
    if os.path.exists(".env"):
        print("Found existing .env file:")
        try:
            with open(".env", "r") as f:
                content = f.read().strip()
                print(
                    content.replace(
                        content.split("\n")[0].split("=")[1], "TOKEN_HIDDEN"
                    )
                    if "\n" in content
                    else content
                )

            overwrite = input("\nOverwrite existing .env file? (y/N): ").strip().lower()
            return overwrite == "y" or overwrite == "yes"
        except:
            overwrite = input("\nOverwrite existing .env file? (y/N): ").strip().lower()
            return overwrite == "y" or overwrite == "yes"
    return True


def run_selfbot():
    """Run the Discord selfbot"""
    print("\n=== Starting Discord SelfBot ===")
    print("Press Ctrl+C to stop the bot\n")

    # Get token from environment
    token = os.getenv("DISCORD_TOKEN")
    if not token:
        print("✗ Error: DISCORD_TOKEN not found in .env file")
        return

    try:
        # Import and run the selfbot
        from discord_selfbot import bot

        # Run the bot
        bot.run(token)
    except KeyboardInterrupt:
        print("\n✓ Bot stopped by user")
    except Exception as e:
        print(f"\n✗ Error running bot: {e}")
        print("Make sure you have entered a valid Discord user token")


def main():
    """Main setup function"""
    print("Discord SelfBot Setup Script")
    print("============================")

    # Install dependencies
    if not install_dependencies():
        print("Failed to install dependencies. Exiting.")
        return 1

    # Check existing .env
    if not check_existing_env():
        print("Setup cancelled.")
        return 0

    # Get user input
    token, prefix = get_user_input()

    # Create .env file
    if not create_env_file(token, prefix):
        print("Failed to create .env file. Exiting.")
        return 1

    # Run the selfbot
    run_selfbot()

    return 0


if __name__ == "__main__":
    sys.exit(main())
