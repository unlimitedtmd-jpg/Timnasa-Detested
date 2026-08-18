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
    name: 'dllogo',
    description: 'Download generated logo',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, from } = utils;
        
        await socket.sendMessage(sender, { react: { text: '🔋', key: msg.key } });
        
        const q = args.join(" "); 
        
        if (!q) {
            return await socket.sendMessage(from, { text: "Please give me a URL" }, { quoted: fakevCard });
        }
        
        try {
            const res = await axios.get(q);
            const images = res.data.result.download_url;
            const randomImage = getRandomImage();

            await socket.sendMessage(from, {
                image: { url: randomImage },
                caption: `✨ *Logo Generated*\n\n${images}`
            }, { quoted: msg });
        } catch (e) {
            console.log('Logo Download Error:', e);
            await socket.sendMessage(from, { text: `❌ Something went wrong. Try again?` }, { quoted: fakevCard });
        }
    }
};