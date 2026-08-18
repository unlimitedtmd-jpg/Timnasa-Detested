const os = require('os');

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
    name: 'bot_stats',
    aliases: ['stats'],
    description: 'View bot statistics',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, activeSockets, socketCreationTime } = utils;
        await socket.sendMessage(sender, { react: { text: '💕 ', key: msg.key } });

        try {
            const startTime = socketCreationTime.get(sender.replace(/[^0-9]/g, '')) || Date.now();
            const uptime = Math.floor((Date.now() - startTime) / 1000);
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            const usedMemory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
            const totalMemory = Math.round(os.totalmem() / 1024 / 1024);
            const activeCount = activeSockets.size;
            const randomImage = getRandomImage();

            const captionText = `╭─╣ *ɴᴊᴀʙᴜʟᴏ ᴊʙ ᴍɪɴɪʙᴏᴛ* ╠⁠┈┈
 ⏰ Uptime: ${hours}h ${minutes}m ${seconds}s
💾 Memory: ${usedMemory}MB / ${totalMemory}MB
👥 Active Users: ${activeCount}
📦 Version: ${config.version}
            `;

            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: captionText
            }, { quoted: fakevCard });
        } catch (error) {
            console.error('Bot stats error:', error);
            await socket.sendMessage(sender, { text: '❌ Failed to retrieve stats.' }, { quoted: fakevCard });
        }
    }
};
