#!/usr/bin/env python3
"""
Discord Bot Management Tool for Hermes Gateway
Provides comprehensive Discord management capabilities that can be used by the Hermes gateway
"""

import os
import sys
import json
import argparse
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DiscordManager:
    def __init__(self):
        self.token = os.getenv('DISCORD_TOKEN')
        if not self.token:
            print("Error: DISCORD_TOKEN not found in environment variables")
            sys.exit(1)
        
        self.base_url = "https://discord.com/api/v10"
        self.headers = {
            "Authorization": f"Bot {self.token}",
            "Content-Type": "application/json"
        }
    
    def _make_request(self, method, endpoint, data=None, params=None):
        """Make HTTP request to Discord API"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=self.headers, params=params)
            elif method.upper() == "POST":
                response = requests.post(url, headers=self.headers, json=data)
            elif method.upper() == "PATCH":
                response = requests.patch(url, headers=self.headers, json=data)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=self.headers)
            else:
                print(f"Error: Unsupported method {method}")
                return None
            
            # Handle rate limiting (simplified)
            if response.status_code == 429:
                # In a real implementation, you'd want to handle this properly
                print("Warning: Rate limited")
            
            response.raise_for_status()
            
            # Return JSON response if content exists
            if response.content:
                return response.json()
            return {}
            
        except requests.exceptions.RequestException as e:
            print(f"Error making {method} request to {endpoint}: {e}")
            if hasattr(e.response, 'text'):
                print(f"Response: {e.response.text}")
            return None
    
    # Message Methods
    def send_message(self, channel_id, content):
        """Send a message to a Discord channel."""
        data = {"content": content}
        return self._make_request("POST", f"/channels/{channel_id}/messages", data)
    
    def send_embed(self, channel_id, title, description, color=0x00ff00):
        """Send an embedded message to a Discord channel."""
        data = {
            "embeds": [{
                "title": title,
                "description": description,
                "color": color
            }]
        }
        return self._make_request("POST", f"/channels/{channel_id}/messages", data)
    
    # Channel Methods
    def create_text_channel(self, guild_id, name, topic="", nsfw=False, rate_limit_per_user=0, parent_id=None, position=None):
        """Create a text channel."""
        data = {
            "name": name,
            "type": 0,  # GuildText
            "topic": topic,
            "nsfw": nsfw,
            "rate_limit_per_user": rate_limit_per_user
        }
        if parent_id:
            data["parent_id"] = parent_id
        if position is not None:
            data["position"] = position
        return self._make_request("POST", f"/guilds/{guild_id}/channels", data)
    
    def create_voice_channel(self, guild_id, name, bitrate=64000, user_limit=0, parent_id=None, position=None):
        """Create a voice channel."""
        data = {
            "name": name,
            "type": 2,  # GuildVoice
            "bitrate": bitrate,
            "user_limit": user_limit
        }
        if parent_id:
            data["parent_id"] = parent_id
        if position is not None:
            data["position"] = position
        return self._make_request("POST", f"/guilds/{guild_id}/channels", data)
    
    def create_category(self, guild_id, name, position=None):
        """Create a category channel."""
        data = {
            "name": name,
            "type": 4,  # GuildCategory
        }
        if position is not None:
            data["position"] = position
        return self._make_request("POST", f"/guilds/{guild_id}/channels", data)
    
    def get_guild_channels(self, guild_id):
        """Get all channels in a guild."""
        return self._make_request("GET", f"/guilds/{guild_id}/channels")
    
    def edit_channel(self, channel_id, **kwargs):
        """Edit channel properties."""
        return self._make_request("PATCH", f"/channels/{channel_id}", kwargs)
    
    def delete_channel(self, channel_id):
        """Delete a channel."""
        return self._make_request("DELETE", f"/channels/{channel_id}")
    
    # Role Methods
    def create_role(self, guild_id, name, permissions=0, color=0, hoist=False, mentionable=False):
        """Create a role."""
        data = {
            "name": name,
            "permissions": str(permissions),  # Permissions as string
            "color": color,
            "hoist": hoist,
            "mentionable": mentionable
        }
        return self._make_request("POST", f"/guilds/{guild_id}/roles", data)
    
    def get_guild_roles(self, guild_id):
        """Get all roles in a guild."""
        return self._make_request("GET", f"/guilds/{guild_id}/roles")
    
    def edit_role(self, guild_id, role_id, **kwargs):
        """Edit role properties."""
        # Convert permissions to string if present
        if 'permissions' in kwargs and not isinstance(kwargs['permissions'], str):
            kwargs['permissions'] = str(kwargs['permissions'])
        return self._make_request("PATCH", f"/guilds/{guild_id}/roles/{role_id}", kwargs)
    
    def delete_role(self, guild_id, role_id):
        """Delete a role."""
        return self._make_request("DELETE", f"/guilds/{guild_id}/roles/{role_id}")
    
    # Member Role Management
    def add_role_to_member(self, guild_id, user_id, role_id):
        """Add a role to a member."""
        return self._make_request("PUT", f"/guilds/{guild_id}/members/{user_id}/roles/{role_id}")
    
    def remove_role_from_member(self, guild_id, user_id, role_id):
        """Remove a role from a member."""
        return self._make_request("DELETE", f"/guilds/{guild_id}/members/{user_id}/roles/{role_id}")
    
    # Utility Methods
    def get_bot_info(self):
        """Get bot user information."""
        return self._make_request("GET", "/users/@me")
    
    def get_guild(self, guild_id):
        """Get guild information."""
        return self._make_request("GET", f"/guilds/{guild_id}")

def main():
    parser = argparse.ArgumentParser(description="Discord Bot Management Tool for Hermes Gateway")
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Message commands
    msg_parser = subparsers.add_parser('message', help='Send a message')
    msg_parser.add_argument('channel_id', help='Channel ID to send message to')
    msg_parser.add_argument('content', help='Message content')
    msg_parser.add_argument('--embed', action='store_true', help='Send as embedded message')
    msg_parser.add_argument('--title', default='Message', help='Title for embedded message')
    msg_parser.add_argument('--color', type=lambda x: int(x, 0), default=0x00ff00, help='Color for embedded message (hex)')
    
    # Channel commands
    chan_parser = subparsers.add_parser('channel', help='Manage channels')
    chan_subparsers = chan_parser.add_subparsers(dest='chan_action', help='Channel actions')
    
    # Create text channel
    create_text = chan_subparsers.add_parser('create-text', help='Create a text channel')
    create_text.add_argument('guild_id', help='Guild ID')
    create_text.add_argument('name', help='Channel name')
    create_text.add_argument('--topic', default='', help='Channel topic')
    create_text.add_argument('--nsfw', action='store_true', help='Mark as NSFW')
    create_text.add_argument('--rate-limit', type=int, default=0, help='Rate limit per user in seconds')
    create_text.add_argument('--parent-id', help='Parent category ID')
    create_text.add_argument('--position', type=int, help='Position in channel list')
    
    # Create voice channel
    create_voice = chan_subparsers.add_parser('create-voice', help='Create a voice channel')
    create_voice.add_argument('guild_id', help='Guild ID')
    create_voice.add_argument('name', help='Channel name')
    create_voice.add_argument('--bitrate', type=int, default=64000, help='Bitrate in bps')
    create_voice.add_argument('--user-limit', type=int, default=0, help='User limit (0 = unlimited)')
    create_voice.add_argument('--parent-id', help='Parent category ID')
    create_voice.add_argument('--position', type=int, help='Position in channel list')
    
    # Create category
    create_cat = chan_subparsers.add_parser('create-category', help='Create a category')
    create_cat.add_argument('guild_id', help='Guild ID')
    create_cat.add_argument('name', help='Category name')
    create_cat.add_argument('--position', type=int, help='Position in channel list')
    
    # List channels
    list_chan = chan_subparsers.add_parser('list', help='List channels in a guild')
    list_chan.add_argument('guild_id', help='Guild ID')
    
    # Delete channel
    del_chan = chan_subparsers.add_parser('delete', help='Delete a channel')
    del_chan.add_argument('channel_id', help='Channel ID to delete')
    
    # Role commands
    role_parser = subparsers.add_parser('role', help='Manage roles')
    role_subparsers = role_parser.add_subparsers(dest='role_action', help='Role actions')
    
    # Create role
    create_role = role_subparsers.add_parser('create', help='Create a role')
    create_role.add_argument('guild_id', help='Guild ID')
    create_role.add_argument('name', help='Role name')
    create_role.add_argument('--permissions', type=str, default='0', help='Permissions string')
    create_role.add_argument('--color', type=lambda x: int(x, 0), default=0, help='Color (hex)')
    create_role.add_argument('--hoist', action='store_true', help='Hoist role')
    create_role.add_argument('--mentionable', action='store_true', help='Make role mentionable')
    
    # List roles
    list_role = role_subparsers.add_parser('list', help='List roles in a guild')
    list_role.add_argument('guild_id', help='Guild ID')
    
    # Delete role
    del_role = role_subparsers.add_parser('delete', help='Delete a role')
    del_role.add_argument('guild_id', help='Guild ID')
    del_role.add_argument('role_id', help='Role ID to delete')
    
    # Member role management
    add_role = role_subparsers.add_parser('add-member', help='Add role to member')
    add_role.add_argument('guild_id', help='Guild ID')
    add_role.add_argument('user_id', help='User ID')
    add_role.add_argument('role_id', help='Role ID')
    
    remove_role = role_subparsers.add_parser('remove-member', help='Remove role from member')
    remove_role.add_argument('guild_id', help='Guild ID')
    remove_role.add_argument('user_id', help='User ID')
    remove_role.add_argument('role_id', help='Role ID')
    
    # Info commands
    info_parser = subparsers.add_parser('info', help='Get information')
    info_subparsers = info_parser.add_subparsers(dest='info_action', help='Info actions')
    
    # Bot info
    bot_info = info_subparsers.add_parser('bot', help='Get bot information')
    
    # Guild info
    guild_info = info_subparsers.add_parser('guild', help='Get guild information')
    guild_info.add_argument('guild_id', help='Guild ID')
    
    # Parse arguments
    args = parser.parse_args()
    
    # Initialize manager
    manager = DiscordManager()
    
    # Execute command
    if args.command == 'message':
        if args.embed:
            result = manager.send_embed(args.channel_id, args.title, args.content, args.color)
        else:
            result = manager.send_message(args.channel_id, args.content)
        
        if result:
            print(f"Message sent successfully. Message ID: {result.get('id')}")
        else:
            print("Failed to send message")
            sys.exit(1)
    
    elif args.command == 'channel':
        if args.chan_action == 'create-text':
            result = manager.create_text_channel(
                args.guild_id, args.name, args.topic, args.nsfw,
                args.rate_limit, args.parent_id, args.position
            )
            if result:
                print(f"Text channel created successfully. Channel ID: {result.get('id')}")
            else:
                print("Failed to create text channel")
                sys.exit(1)
        
        elif args.chan_action == 'create-voice':
            result = manager.create_voice_channel(
                args.guild_id, args.name, args.bitrate, args.user_limit,
                args.parent_id, args.position
            )
            if result:
                print(f"Voice channel created successfully. Channel ID: {result.get('id')}")
            else:
                print("Failed to create voice channel")
                sys.exit(1)
        
        elif args.chan_action == 'create-category':
            result = manager.create_category(args.guild_id, args.name, args.position)
            if result:
                print(f"Category created successfully. Channel ID: {result.get('id')}")
            else:
                print("Failed to create category")
                sys.exit(1)
        
        elif args.chan_action == 'list':
            result = manager.get_guild_channels(args.guild_id)
            if result is not None:
                print(json.dumps(result, indent=2))
            else:
                print("Failed to get channels")
                sys.exit(1)
        
        elif args.chan_action == 'delete':
            result = manager.delete_channel(args.channel_id)
            if result is not None:
                print(f"Channel {args.channel_id} deleted successfully")
            else:
                print("Failed to delete channel")
                sys.exit(1)
    
    elif args.command == 'role':
        if args.role_action == 'create':
            result = manager.create_role(
                args.guild_id, args.name, args.permissions, args.color,
                args.hoist, args.mentionable
            )
            if result:
                print(f"Role created successfully. Role ID: {result.get('id')}")
            else:
                print("Failed to create role")
                sys.exit(1)
        
        elif args.role_action == 'list':
            result = manager.get_guild_roles(args.guild_id)
            if result is not None:
                print(json.dumps(result, indent=2))
            else:
                print("Failed to get roles")
                sys.exit(1)
        
        elif args.role_action == 'delete':
            result = manager.delete_role(args.guild_id, args.role_id)
            if result is not None:
                print(f"Role {args.role_id} deleted successfully")
            else:
                print("Failed to delete role")
                sys.exit(1)
        
        elif args.role_action == 'add-member':
            result = manager.add_role_to_member(args.guild_id, args.user_id, args.role_id)
            if result is not None:
                print(f"Role {args.role_id} added to user {args.user_id} successfully")
            else:
                print("Failed to add role to member")
                sys.exit(1)
        
        elif args.role_action == 'remove-member':
            result = manager.remove_role_from_member(args.guild_id, args.user_id, args.role_id)
            if result is not None:
                print(f"Role {args.role_id} removed from user {args.user_id} successfully")
            else:
                print("Failed to remove role from member")
                sys.exit(1)
    
    elif args.command == 'info':
        if args.info_action == 'bot':
            result = manager.get_bot_info()
            if result:
                print(json.dumps(result, indent=2))
            else:
                print("Failed to get bot info")
                sys.exit(1)
        
        elif args.info_action == 'guild':
            result = manager.get_guild(args.guild_id)
            if result:
                print(json.dumps(result, indent=2))
            else:
                print("Failed to get guild info")
                sys.exit(1)
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()