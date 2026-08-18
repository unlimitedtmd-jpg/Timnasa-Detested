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
    name: 'aiimg',
    description: 'Generate AI images',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        await socket.sendMessage(sender, { react: { text: '🔮', key: msg.key } });
        
        const q = msg.message?.conversation ||
                  msg.message?.extendedTextMessage?.text ||
                  msg.message?.imageMessage?.caption ||
                  msg.message?.videoMessage?.caption || '';

        const prompt = q.trim();

        if (!prompt) {
            return await socket.sendMessage(sender, {
                text: '🎨 *Give me a prompt to create your AI image*'
            });
        }

        try {
            await socket.sendMessage(sender, { text: '🧠 *Crafting your image...*' });

            const apiUrl = `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(prompt)}`;
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

            if (!response || !response.data) {
                return await socket.sendMessage(sender, { text: '❌ *Failed to generate image.*' });
            }

            const imageBuffer = Buffer.from(response.data, 'binary');

            await socket.sendMessage(sender, {
                image: imageBuffer,
                caption: `🧠 *AI Image Generated*\n\n📌 Prompt: ${prompt}`
            }, { quoted: fakevCard });
        } catch (err) {
            console.error('AI Image Error:', err);
            await socket.sendMessage(sender, {
                text: `❗ *Error:* ${err.response?.data?.message || err.message || 'Unknown error'}`
            });
        }
    }
};