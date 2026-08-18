const axios = require('axios');

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
    name: 'fancy',
    description: 'Convert text to fancy fonts',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        await socket.sendMessage(sender, { react: { text: '🖋', key: msg.key } });
        
        const q = msg.message?.conversation ||
                  msg.message?.extendedTextMessage?.text ||
                  msg.message?.imageMessage?.caption ||
                  msg.message?.videoMessage?.caption || '';

        const text = q.trim().replace(/^.fancy\s+/i, "");

        if (!text) {
            return await socket.sendMessage(sender, { text: "❎ *Give me text to make fancy*\n\n📌 *Example:* `.fancy Njabulo`" });
        }

        try {
            const response = await axios.get(`https://www.dark-yasiya-api.site/other/font?text=${encodeURIComponent(text)}`);
            if (!response.data.status || !response.data.result) {
                return await socket.sendMessage(sender, { text: "❌ *Fonts not available. Try again*" });
            }

            const fontList = response.data.result.map(f => `*${f.name}:*\n${f.result}`).join("\n\n");
            const randomImage = getRandomImage();
            
            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `🎨 *Fancy Fonts Converter*\n\n${fontList}`
            }, { quoted: fakevCard });
        } catch (err) {
            console.error("Fancy Font Error:", err);
            await socket.sendMessage(sender, { text: "⚠️ *Something went wrong. Try again?*" });
        }
    }
};