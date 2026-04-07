const { EmbedBuilder } = require('discord.js');

const colors = {
    default: '#5865F2',
    success: '#3BA55C',
    error: '#ED4245',
    warning: '#FAA61A',
    info: '#00B2F4',
    premium: '#FF73FA',
    dark: '#23272A'
};

const footers = {
    bot: 'Apex Bot',
    mod: 'Moderation',
    info: 'Information',
    fun: 'Fun',
    utility: 'Utility'
};

function generateEmbed(options = {}) {
    const {
        title,
        description,
        color = colors.default,
        author,
        authorIcon,
        thumbnail,
        image,
        fields = [],
        footer,
        footerIcon,
        timestamp = true,
        url,
        type = 'default'
    } = options;

    const embed = new EmbedBuilder();

    const typeColors = {
        default: colors.default,
        success: colors.success,
        error: colors.error,
        warning: colors.warning,
        info: colors.info,
        premium: colors.premium,
        dark: colors.dark
    };

    embed.setColor(typeColors[type] || color);

    if (title) {
        let emoji = '';
        switch (type) {
            case 'success': emoji = '✅ '; break;
            case 'error': emoji = '❌ '; break;
            case 'warning': emoji = '⚠️ '; break;
            case 'info': emoji = 'ℹ️ '; break;
            case 'premium': emoji = '⭐ '; break;
            default: emoji = '';
        }
        embed.setTitle(emoji + title);
    }

    if (description) {
        embed.setDescription(description);
    }

    if (author) {
        embed.setAuthor({
            name: author,
            iconURL: authorIcon
        });
    }

    if (thumbnail) {
        embed.setThumbnail(thumbnail);
    }

    if (image) {
        embed.setImage(image);
    }

    if (url) {
        embed.setURL(url);
    }

    if (fields.length > 0) {
        embed.addFields(fields.map((field, index) => ({
            name: field.name || '\u200B',
            value: field.value || '\u200B',
            inline: field.inline !== undefined ? field.inline : index % 3 !== 2
        })));
    }

    if (footer) {
        embed.setFooter({
            text: footer,
            iconURL: footerIcon
        });
    } else {
        embed.setFooter({
            text: 'Apex Bot',
            iconURL: 'https://i.imgur.com/discord-icon.png'
        });
    }

    if (timestamp) {
        embed.setTimestamp();
    }

    return embed;
}

function errorEmbed(message, title = 'Error') {
    return generateEmbed({
        title,
        description: message,
        color: colors.error,
        type: 'error'
    }).setFooter({ text: 'Apex Bot | Error', iconURL: 'https://i.imgur.com/discord-icon.png' });
}

function successEmbed(message, title = 'Success') {
    return generateEmbed({
        title,
        description: message,
        color: colors.success,
        type: 'success'
    }).setFooter({ text: 'Apex Bot | Success', iconURL: 'https://i.imgur.com/discord-icon.png' });
}

function warnEmbed(message, title = 'Warning') {
    return generateEmbed({
        title,
        description: message,
        color: colors.warning,
        type: 'warning'
    }).setFooter({ text: 'Apex Bot | Warning', iconURL: 'https://i.imgur.com/discord-icon.png' });
}

function infoEmbed(title, message) {
    return generateEmbed({
        title,
        description: message,
        color: colors.info,
        type: 'info'
    });
}

function modEmbed(title, description, fields = []) {
    return generateEmbed({
        title,
        description,
        color: colors.warning,
        type: 'warning',
        fields,
        footer: 'Moderation Action'
    });
}

function funEmbed(title, description) {
    return generateEmbed({
        title,
        description,
        color: colors.premium,
        type: 'premium',
        footer: 'Fun'
    });
}

module.exports = { 
    generateEmbed, 
    errorEmbed, 
    successEmbed, 
    warnEmbed, 
    infoEmbed,
    modEmbed,
    funEmbed,
    colors,
    footers
};