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
    name: 'shorturl',
    description: 'Shorten a URL',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        try {
            await socket.sendMessage(sender, { react: { text: '🔗', key: msg.key } });

            const url = args.join(' ').trim();
            if (!url) {
                await socket.sendMessage(sender, {
                    text: `📌 *Usage:* ${config.PREFIX}shorturl <url>\n*Example:* ${config.PREFIX}shorturl https://example.com`
                }, { quoted: msg });
                return;
            }
            
            if (!/^https?:\/\//.test(url)) {
                await socket.sendMessage(sender, { text: `❌ *Invalid URL!* Include http:// or https://` }, { quoted: msg });
                return;
            }

            const response = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`, { timeout: 5000 });
            const shortUrl = response.data.trim();

            if (!shortUrl || !shortUrl.startsWith('https://is.gd/')) {
                throw new Error('Failed to shorten URL');
            }

            const randomImage = getRandomImage();

            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `✅ *Short URL Created!*\n\n🌐 Original: ${url}\n🔗 Shortened: ${shortUrl}`
            }, { quoted: msg });

            await new Promise(resolve => setTimeout(resolve, 2000));
            await socket.sendMessage(sender, { text: shortUrl }, { quoted: msg });

        } catch (error) {
            console.error('Shorturl error:', error.message);
            await socket.sendMessage(sender, { text: `❌ *Couldn't shorten URL!*` }, { quoted: msg });
        }
    }
};