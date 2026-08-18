// ========== RANDOM IMAGE ==========
function getRandomImage() {
    const images = [
        "https://raw.githubusercontent.com/NjabuloJf/njabulo-data/main/njabuloimg/njabuloimg.png",
        "https://raw.githubusercontent.com/NjabuloJf/njabulo-data/main/njabuloimg/njabuloimg2.png",
        "https://raw.githubusercontent.com/NjabuloJf/njabulo-data/main/njabuloimg/njabuloimg3.png",
        "https://raw.githubusercontent.com/NjabuloJf/njabulo-data/main/njabuloimg/njabuloimg4.png",
        "https://raw.githubusercontent.com/NjabuloJf/njabulo-data/main/njabuloimg/njabuloimg5.png",
    ];
    return images[Math.floor(Math.random() * images.length)];
}

module.exports = {
    name: 'kickall',
    aliases: ['removeall', 'cleargroup'],
    description: 'Remove all non-admin members from group',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, isGroup, isSenderGroupAdmin, isOwner, from } = utils;
        
        await socket.sendMessage(sender, { react: { text: '⚡', key: msg.key } });

        if (!isGroup) {
            return await socket.sendMessage(sender, { text: '❌ *This command can only be used in groups!*' }, { quoted: fakevCard });
        }
        if (!isSenderGroupAdmin && !isOwner) {
            return await socket.sendMessage(sender, { text: '❌ *Only group admins or owner can use this!*' }, { quoted: fakevCard });
        }

        try {
            const groupMetadata = await socket.groupMetadata(from);
            const botJid = socket.user?.id || socket.user?.jid;

            const membersToRemove = groupMetadata.participants
                .filter(p => p.admin === null && p.id !== botJid)
                .map(p => p.id);

            if (membersToRemove.length === 0) {
                return await socket.sendMessage(sender, { text: '❌ *No members to remove (all are admins or bot).*' }, { quoted: fakevCard });
            }

            await socket.sendMessage(sender, { text: `⚠️ *WARNING*\n\nRemoving *${membersToRemove.length}* members...` }, { quoted: fakevCard });

            const batchSize = 50;
            for (let i = 0; i < membersToRemove.length; i += batchSize) {
                const batch = membersToRemove.slice(i, i + batchSize);
                await socket.groupParticipantsUpdate(from, batch, 'remove');
                await new Promise(r => setTimeout(r, 2000));
            }

            const randomImage = getRandomImage();
            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `🧹 *Group Cleaned!*\n\n✅ Successfully removed *${membersToRemove.length}* members.\n\n> Executed by: @${sender.split('@')[0]}`,
                mentions: [sender]
            }, { quoted: fakevCard });

        } catch (error) {
            console.error('Kickall error:', error);
            await socket.sendMessage(sender, { text: `❌ *Failed to remove members!*\nError: ${error.message || 'Unknown error'}` }, { quoted: fakevCard });
        }
    }
};