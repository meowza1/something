const patterns = {
    discordInvite: /discord(?:\.gg|app\.com\/invite)\/([a-zA-Z0-9-]+)/gi,
    url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
    ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    mention: /<@!?(\d+)>/g,
    roleMention: /<@&(\d+)>/g,
    channelMention: /<#(\d+)>/g,
    emoji: /<a?:\w+:(\d+)>/g,
    snowflake: /\b\d{17,19}\b/g,
    time: /(\d{1,2}):(\d{2})(?::(\d{2}))?/g,
    date: /(\d{4})-(\d{2})-(\d{2})/g,
    duration: /(\d+)([dhms])/gi,
    hexColor: /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/gi,
    codeBlock: /```(?:[\w]*\n)?([\s\S]*?)```/g,
    userMention: /<@(\d+)>/g,
    botMention: /<@!(\d+)>/g
};

function isUrl(text) {
    return patterns.url.test(text);
}

function isInvite(text) {
    return patterns.discordInvite.test(text);
}

function isEmail(text) {
    return patterns.email.test(text);
}

function extractUrls(text) {
    return text.match(patterns.url) || [];
}

function extractMentions(text) {
    const mentions = {
        users: [],
        roles: [],
        channels: []
    };
    
    let match;
    while ((match = patterns.userMention.exec(text)) !== null) {
        mentions.users.push(match[1]);
    }
    while ((match = patterns.roleMention.exec(text)) !== null) {
        mentions.roles.push(match[1]);
    }
    while ((match = patterns.channelMention.exec(text)) !== null) {
        mentions.channels.push(match[1]);
    }
    
    return mentions;
}

module.exports = { patterns, isUrl, isInvite, isEmail, extractUrls, extractMentions };