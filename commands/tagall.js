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
    name: 'tagall',
    description: 'Tag all group members',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, isGroup, isSenderGroupAdmin, isOwner, from } = utils;
        
        await socket.sendMessage(sender, { react: { text: '🫂', key: msg.key } });
        
        if (!isGroup) {
            return await socket.sendMessage(sender, { text: '❌ *This command can only be used in groups!*' }, { quoted: fakevCard });
        }
        if (!isSenderGroupAdmin && !isOwner) {
            return await socket.sendMessage(sender, { text: '❌ *Only group admins or owner can tag all!*' }, { quoted: fakevCard });
        }
        try {
            const groupMetadata = await socket.groupMetadata(from);
            const participants = groupMetadata.participants.map(p => p.id);
            let message = args.join(' ') || '📢 *Attention everyone!*';
            const randomImage = getRandomImage();
            await socket.sendMessage(from, {
                image: { url: randomImage },
                caption: `👥 *Tag All*\n\n${message}\n\nTagged ${participants.length} members!`,
                mentions: participants
            }, { quoted: fakevCard });
        } catch (error) {
            console.error('Tagall error:', error);
            await socket.sendMessage(sender, { text: `❌ *Failed to tag all!*` }, { quoted: fakevCard });
        }
    }
};