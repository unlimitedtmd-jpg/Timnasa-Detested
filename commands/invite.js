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
    name: 'invite',
    aliases: ['grouplink', 'linkgroup'],
    description: 'Get group invite link',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, isGroup, isSenderGroupAdmin, isOwner, from } = utils;
        
        await socket.sendMessage(sender, { react: { text: '🔗', key: msg.key } });

        if (!isGroup) {
            return await socket.sendMessage(sender, { text: '❌ *This command can only be used in groups!*' }, { quoted: fakevCard });
        }
        if (!isSenderGroupAdmin && !isOwner) {
            return await socket.sendMessage(sender, { text: '❌ *Only group admins or owner can get link!*' }, { quoted: fakevCard });
        }

        try {
            const groupLink = await socket.groupInviteCode(from);
            const fullLink = `https://chat.whatsapp.com/${groupLink}`;
            const randomImage = getRandomImage();

            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `🔗 *Group Link*\n\n📌 ${fullLink}\n\n> Requested by @${sender.split('@')[0]}`,
                mentions: [sender]
            }, { quoted: fakevCard });

        } catch (error) {
            console.error('Invite error:', error);
            await socket.sendMessage(sender, { text: `❌ *Failed to get group link!*` }, { quoted: fakevCard });
        }
    }
};