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
    name: 'demote',
    description: 'Demote admin to member',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, isGroup, isSenderGroupAdmin, isOwner, from } = utils;
        
        await socket.sendMessage(sender, { react: { text: '🙆‍♀️', key: msg.key } });
        
        if (!isGroup) {
            return await socket.sendMessage(sender, { text: '❌ *This command can only be used in groups!*' }, { quoted: fakevCard });
        }
        if (!isSenderGroupAdmin && !isOwner) {
            return await socket.sendMessage(sender, { text: '❌ *Only group admins or owner can demote!*' }, { quoted: fakevCard });
        }
        if (args.length === 0 && !msg.quoted) {
            return await socket.sendMessage(sender, { text: `📌 *Usage:* ${config.PREFIX}demote +26777821911` }, { quoted: fakevCard });
        }
        try {
            let numberToDemote;
            if (msg.quoted) {
                numberToDemote = msg.quoted.sender;
            } else {
                numberToDemote = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }
            await socket.groupParticipantsUpdate(from, [numberToDemote], 'demote');
            const randomImage = getRandomImage();
            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `⬇️ *Admin Demoted!*\n\n${numberToDemote.split('@')[0]} is now a member!`
            }, { quoted: fakevCard });
        } catch (error) {
            console.error('Demote error:', error);
            await socket.sendMessage(sender, { text: `❌ *Failed to demote!*` }, { quoted: fakevCard });
        }
    }
};