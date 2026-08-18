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
    name: 'close',
    aliases: ['mute'],
    description: 'Close group for non-admins',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, isGroup, isSenderGroupAdmin, isOwner, from } = utils;
        
        await socket.sendMessage(sender, { react: { text: '🔒', key: msg.key } });
        
        if (!isGroup) {
            return await socket.sendMessage(sender, { text: '❌ *This command can only be used in groups!*' }, { quoted: fakevCard });
        }
        if (!isSenderGroupAdmin && !isOwner) {
            return await socket.sendMessage(sender, { text: '❌ *Only group admins or owner can close!*' }, { quoted: fakevCard });
        }
        
        try {
            await socket.groupSettingUpdate(from, 'announcement');
            const randomImage = getRandomImage();
            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `🔒 *Group Closed!*\n\nOnly admins can now send messages. 🤫`
            }, { quoted: fakevCard });
        } catch (error) {
            console.error('Close error:', error);
            await socket.sendMessage(sender, { text: `❌ *Failed to close group!*` }, { quoted: fakevCard });
        }
    }
};