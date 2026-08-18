const cheerio = require('cheerio');

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
    name: 'gossip',
    description: 'Get entertainment gossip',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        await socket.sendMessage(sender, { react: { text: '😅', key: msg.key } });
        
        try {
            const response = await fetch('https://suhas-bro-api.vercel.app/news/gossiplankanews');
            if (!response.ok) throw new Error('Failed to fetch gossip');
            const data = await response.json();

            if (!data.status || !data.result) throw new Error('Invalid data');

            const { title, desc, date, link } = data.result;
            let thumbnailUrl = getRandomImage();
            
            try {
                const pageResponse = await fetch(link);
                if (pageResponse.ok) {
                    const pageHtml = await pageResponse.text();
                    const $ = cheerio.load(pageHtml);
                    const ogImage = $('meta[property="og:image"]').attr('content');
                    if (ogImage) thumbnailUrl = ogImage;
                }
            } catch (err) {}

            await socket.sendMessage(sender, {
                image: { url: thumbnailUrl },
                caption: `🎭 *Gossip News*\n\n📢 ${title}\n\n${desc}\n\n🕒 ${date || 'N/A'}\n🌐 ${link}`
            }, { quoted: fakevCard });
        } catch (error) {
            console.error('Gossip error:', error);
            await socket.sendMessage(sender, { text: '⚠️ Gossip not available. Try again?' }, { quoted: fakevCard });
        }
    }
};