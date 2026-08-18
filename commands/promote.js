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
    name: 'promote',
    description: 'Promote member to admin',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, isGroup, isSenderGroupAdmin, isOwner, from } = utils;
        
        await socket.sendMessage(sender, { react: { text: '👑', key: msg.key } });
        
        if (!isGroup) {
            return await socket.sendMessage(sender, { text: '❌ *This command can only be used in groups!*' }, { quoted: fakevCard });
        }
        if (!isSenderGroupAdmin && !isOwner) {
            return await socket.sendMessage(sender, { text: '❌ *Only group admins or owner can promote!*' }, { quoted: fakevCard });
        }
        if (args.length === 0 && !msg.quoted) {
            return await socket.sendMessage(sender, { text: `📌 *Usage:* ${config.PREFIX}promote +26777821911` }, { quoted: fakevCard });
        }
        try {
            let numberToPromote;
            if (msg.quoted) {
                numberToPromote = msg.quoted.sender;
            } else {
                numberToPromote = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }
            await socket.groupParticipantsUpdate(from, [numberToPromote], 'promote');
            const randomImage = getRandomImage();
            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `⬆️ *Admin Promoted!*\n\n${numberToPromote.split('@')[0]} is now an admin! 🌟`
            }, { quoted: fakevCard });
        } catch (error) {
            console.error('Promote error:', error);
            await socket.sendMessage(sender, { text: `❌ *Failed to promote!*` }, { quoted: fakevCard });
        }
    }
};