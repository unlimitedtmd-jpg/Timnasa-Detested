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

// ========== RUNTIME FUNCTION ==========
function runtime(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
    const hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
    const mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
    const sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

module.exports = {
    name: 'ping',
    aliases: ['pong', 'latency'],
    description: 'Check bot response speed',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        const dest = msg.key.remoteJid;
        
        try {
            await socket.sendMessage(sender, { react: { text: '📍', key: msg.key } });

            const startTime = new Date().getTime();
            const responseTime = (new Date().getTime() - startTime) / 1000;
            const uptimeSeconds = process.uptime();
            const uptimeText = runtime(uptimeSeconds);
            const randomImage = getRandomImage();

            let reactionEmoji = '';
            let pingQuality = '';
            if (responseTime < 0.1) {
                pingQuality = '🟢 Excellent';
                reactionEmoji = '🚀';
            } else if (responseTime < 0.3) {
                pingQuality = '🟡 Good';
                reactionEmoji = '⚡';
            } else if (responseTime < 0.6) {
                pingQuality = '🟠 Fair';
                reactionEmoji = '⏳';
            } else {
                pingQuality = '🔴 Poor';
                reactionEmoji = '🐌';
            }

            const message = `╭─╣ *ɴᴊᴀʙᴜʟᴏ ᴊʙ ᴍɪɴɪʙᴏᴛ* ╠⁠┈┈
🏓 *Ping!:* ${responseTime.toFixed(2)}s
${pingQuality}
🕒 *Response Time:* ${new Date().toLocaleString()}
⏳ *Uptime:* ${uptimeText}
            `;

            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: message
            }, { quoted: fakevCard });

        } catch (error) {
            console.error('Ping command error:', error);
            const randomImage = getRandomImage();
            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `❌ *Error:* ${error.message || 'Unknown error'}\n\n💡 Try again later`
            }, { quoted: fakevCard });
        }
    }
};
