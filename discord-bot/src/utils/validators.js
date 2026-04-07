const { Collection } = require('discord.js');

function validateUser(user) {
    if (!user || !user.id) {
        return { valid: false, error: 'Invalid user' };
    }
    return { valid: true };
}

function validateGuild(guild) {
    if (!guild || !guild.id) {
        return { valid: false, error: 'Invalid guild' };
    }
    return { valid: true };
}

function validateChannel(channel) {
    if (!channel || !channel.id) {
        return { valid: false, error: 'Invalid channel' };
    }
    return { valid: true };
}

function validateRole(role) {
    if (!role || !role.id) {
        return { valid: false, error: 'Invalid role' };
    }
    return { valid: true };
}

function validateNumber(value, min, max) {
    const num = Number(value);
    if (isNaN(num)) {
        return { valid: false, error: 'Value must be a number' };
    }
    if (min !== undefined && num < min) {
        return { valid: false, error: `Value must be at least ${min}` };
    }
    if (max !== undefined && num > max) {
        return { valid: false, error: `Value must be at most ${max}` };
    }
    return { valid: true, value: num };
}

function validateString(value, minLength, maxLength) {
    if (typeof value !== 'string') {
        return { valid: false, error: 'Value must be a string' };
    }
    if (minLength !== undefined && value.length < minLength) {
        return { valid: false, error: `Value must be at least ${minLength} characters` };
    }
    if (maxLength !== undefined && value.length > maxLength) {
        return { valid: false, error: `Value must be at most ${maxLength} characters` };
    }
    return { valid: true, value };
}

function validateSnowflake(id) {
    if (!id || !/^\d{17,19}$/.test(id.toString())) {
        return { valid: false, error: 'Invalid snowflake ID' };
    }
    return { valid: true };
}

function validateDuration(duration) {
    const regex = /(\d+)([dhms])/gi;
    let total = 0;
    let match;
    while ((match = regex.exec(duration)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        switch (unit) {
            case 'd': total += value * 86400000; break;
            case 'h': total += value * 3600000; break;
            case 'm': total += value * 60000; break;
            case 's': total += value * 1000; break;
        }
    }
    if (total === 0) {
        return { valid: false, error: 'Invalid duration format (use: 1d, 1h, 1m, 1s)' };
    }
    return { valid: true, ms: total };
}

function validateColor(color) {
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        return { valid: true };
    }
    if (/^[0-9A-Fa-f]{6}$/.test(color)) {
        return { valid: true, value: '#' + color };
    }
    return { valid: false, error: 'Invalid color format (use: #RRGGBB or RRGGBB)' };
}

module.exports = {
    validateUser,
    validateGuild,
    validateChannel,
    validateRole,
    validateNumber,
    validateString,
    validateSnowflake,
    validateDuration,
    validateColor
};