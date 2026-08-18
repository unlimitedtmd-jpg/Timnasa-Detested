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
    name: 'bot_info',
    aliases: ['info', 'about'],
    description: 'Get bot information',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        await socket.sendMessage(sender, { react: { text: '🤔 ', key: msg.key } });

        
        try {
            const randomImage = getRandomImage();
            const captionText = `╭─╣ *ɴᴊᴀʙᴜʟᴏ ᴊʙ ᴍɪɴɪʙᴏᴛ* ╠⁠┈┈
👑 Creator: Njabulo JB
🌐 Version: ${config.version}
📍 Prefix: ${config.PREFIX}
📖 Desc: Your WhatsApp companion
            `;
            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: captionText
            }, { quoted: fakevCard });
        } catch (error) {
            console.error('Bot info error:', error);
            await socket.sendMessage(sender, { text: '❌ Failed to retrieve bot info.' }, { quoted: fakevCard });
        }
    }
};
