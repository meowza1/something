const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');

async function pagination(client, message, pages, options = {}) {
    const {
        timeout = 120000,
        buttonStyle = 'Secondary',
        startLabel = '⏮',
        backLabel = '◀',
        forwardLabel = '▶',
        endLabel = '⏭',
        deleteLabel = '🗑️'
    } = options;

    if (!pages.length) throw new Error('No pages provided');
    if (pages.length === 1) {
        if (typeof pages[0] === 'object') {
            return message.reply({ embeds: [pages[0]] });
        }
        return message.reply(pages[0]);
    }

    let currentPage = 0;
    const getRow = (page) => {
        const row = new ActionRowBuilder();
        
        if (pages.length > 2) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('start')
                    .setLabel(startLabel)
                    .setStyle(buttonStyle)
                    .setDisabled(page === 0)
            );
        }
        
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('back')
                .setLabel(backLabel)
                .setStyle(buttonStyle)
                .setDisabled(page === 0),
            new ButtonBuilder()
                .setCustomId('forward')
                .setLabel(forwardLabel)
                .setStyle(buttonStyle)
                .setDisabled(page === pages.length - 1)
        );
        
        if (pages.length > 2) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('end')
                    .setLabel(endLabel)
                    .setStyle(buttonStyle)
                    .setDisabled(page === pages.length - 1)
            );
        }
        
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('delete')
                .setLabel(deleteLabel)
                .setStyle('Danger')
        );
        
        return row;
    };

    const msg = await message.reply({
        embeds: [pages[0].setFooter({ text: `Page ${currentPage + 1} / ${pages.length}` })],
        components: [getRow(currentPage)]
    });

    const collector = msg.createMessageComponentCollector({
        filter: (i) => i.user.id === message.author.id,
        time: timeout
    });

    collector.on('collect', async (i) => {
        switch (i.customId) {
            case 'start':
                currentPage = 0;
                break;
            case 'back':
                currentPage = currentPage > 0 ? currentPage - 1 : currentPage;
                break;
            case 'forward':
                currentPage = currentPage < pages.length - 1 ? currentPage + 1 : currentPage;
                break;
            case 'end':
                currentPage = pages.length - 1;
                break;
            case 'delete':
                await msg.delete();
                return;
        }

        await i.update({
            embeds: [pages[currentPage].setFooter({ text: `Page ${currentPage + 1} / ${pages.length}` })],
            components: [getRow(currentPage)]
        });
    });

    collector.on('end', async () => {
        try {
            await msg.edit({ components: [] }).catch(() => {});
        } catch (e) {}
    });

    return msg;
}

module.exports = { pagination };