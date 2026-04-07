const { PermissionFlagsBits } = require('discord.js');

function canModerate(sender, target, guild) {
    if (sender.id === guild.ownerId) return { allowed: true };
    
    const senderMember = sender;
    const targetMember = target;
    
    if (senderMember.id === targetMember.id) {
        return { allowed: false, reason: 'You cannot moderate yourself' };
    }
    
    if (targetMember.id === guild.ownerId) {
        return { allowed: false, reason: 'You cannot moderate the server owner' };
    }
    
    if (targetMember.id === guild.client.user.id) {
        return { allowed: false, reason: 'You cannot moderate the bot' };
    }
    
    const senderRoles = senderMember.roles.cache.map(r => r.position);
    const targetRoles = targetMember.roles.cache.map(r => r.position);
    
    const senderHighest = Math.max(...senderRoles, 0);
    const targetHighest = Math.max(...targetRoles, 0);
    
    if (targetHighest >= senderHighest && sender.id !== guild.ownerId) {
        return { allowed: false, reason: 'You cannot moderate someone with equal or higher role' };
    }
    
    return { allowed: true };
}

function checkPermissions(member, requiredPermissions) {
    const missing = [];
    
    for (const perm of requiredPermissions) {
        if (!member.permissions.has(perm)) {
            missing.push(perm);
        }
    }
    
    return {
        has: missing.length === 0,
        missing
    };
}

function checkBotPermissions(channel, requiredPermissions) {
    const missing = [];
    
    for (const perm of requiredPermissions) {
        if (!channel.permissionsFor(channel.guild.members.me).has(perm)) {
            missing.push(perm);
        }
    }
    
    return {
        has: missing.length === 0,
        missing
    };
}

const modPermissions = [
    PermissionFlagsBits.KickMembers,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.MuteMembers,
    PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.ManageRoles
];

const adminPermissions = [
    PermissionFlagsBits.Administrator,
    PermissionFlagsBits.ManageGuild
];

const ownerOnlyPermissions = [
    'owner'
];

function isOwner(guild, userId) {
    return guild.ownerId === userId;
}

module.exports = {
    canModerate,
    checkPermissions,
    checkBotPermissions,
    modPermissions,
    adminPermissions,
    isOwner
};