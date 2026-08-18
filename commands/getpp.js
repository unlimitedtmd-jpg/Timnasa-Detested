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
    name: 'getpp',
    aliases: ['pp', 'profile'],
    description: 'Get profile picture of a user',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        await socket.sendMessage(sender, { react: { text: '👤', key: msg.key } });
        
        try {
            let targetUser = sender;
            
            if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetUser = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (msg.quoted) {
                targetUser = msg.quoted.sender;
            }
            
            const ppUrl = await socket.profilePictureUrl(targetUser, 'image').catch(() => null);
            const randomImage = getRandomImage();
            
            if (ppUrl) {
                await socket.sendMessage(msg.key.remoteJid, {
                    image: { url: ppUrl },
                    caption: `🖼️ Profile picture of @${targetUser.split('@')[0]}`,
                    mentions: [targetUser]
                });
            } else {
                await socket.sendMessage(msg.key.remoteJid, {
                    image: { url: randomImage },
                    caption: `❌ @${targetUser.split('@')[0]} has no profile picture.`
                });
            }
        } catch (error) {
            await socket.sendMessage(msg.key.remoteJid, { text: "❌ Error fetching profile picture." });
        }
    }
};
