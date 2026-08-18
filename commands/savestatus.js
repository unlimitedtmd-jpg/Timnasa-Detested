const fs = require('fs');

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
    name: 'savestatus',
    description: 'Save someone\'s status',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        try {
            await socket.sendMessage(sender, { react: { text: '💾', key: msg.key } });

            if (!msg.quoted || !msg.quoted.statusMessage) {
                await socket.sendMessage(sender, { text: `📌 *Reply to a status to save it*` }, { quoted: msg });
                return;
            }

            await socket.sendMessage(sender, { text: `⏳ *Saving status...*` }, { quoted: msg });

            const media = await socket.downloadMediaMessage(msg.quoted);
            const fileExt = msg.quoted.imageMessage ? 'jpg' : 'mp4';
            const filePath = `./status_${Date.now()}.${fileExt}`;
            fs.writeFileSync(filePath, media);

            const randomImage = getRandomImage();

            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `✅ *Status Saved!*\n\n📁 File: status_${Date.now()}.${fileExt}`
            }, { quoted: msg });

        } catch (error) {
            console.error('Savestatus error:', error.message);
            await socket.sendMessage(sender, { text: `❌ *Couldn't save status!*` }, { quoted: msg });
        }
    }
};