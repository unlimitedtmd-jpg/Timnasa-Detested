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

// ========== GOOGLE IMAGE SEARCH ==========
const GCSE_KEY = 'AIzaSyDMbI3nvmQUrfjoCJYLS69Lej1hSXQjnWI';
const GCSE_CX = 'baf9bdb0c631236e5';

async function searchImages(query) {
    try {
        const { data } = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                q: query,
                key: GCSE_KEY,
                cx: GCSE_CX,
                searchType: 'image',
                num: 4,
                safe: 'off'
            },
            timeout: 15000
        });
        
        if (!data.items || data.items.length === 0) return [];
        
        return data.items.map(item => ({
            url: item.link,
            title: item.title,
            snippet: item.snippet
        }));
    } catch (error) {
        console.error("Google Images API error:", error.response?.data || error.message);
        return [];
    }
}

module.exports = {
    name: 'image',
    aliases: ['pic', 'picture'],
    description: 'Search and get images',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        const dest = msg.key.remoteJid;
        
        let query = args ? args.join(' ') : '';

        if (!query || query.trim() === '') {
            const randomImage = getRandomImage();
            return await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: '🖼️ *Please provide a search query*\n\nExample: .image sunset beach'
            }, { quoted: msg });
        }

        try {
            const randomImage = getRandomImage();

            const images = await searchImages(query);
            
            if (!images || images.length === 0) {
                return await socket.sendMessage(dest, {
                    image: { url: randomImage },
                    caption: '❌ *No images found for your query.*'
                }, { quoted: msg });
            }

            // Send images
            for (let i = 0; i < Math.min(images.length, 4); i++) {
                try {
                    await socket.sendMessage(dest, {
                        image: { url: images[i].url },
                        caption: `🖼️ *${images[i].title || 'Image'}}*`
                    }, { quoted: fakevCard });
                } catch (err) {
                    continue;
                }
            }

            await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `✅ *Sent ${Math.min(images.length, 4)} images for: ${query}*`
            }, { quoted: msg });

        } catch (err) {
            console.error('[IMAGE] Error:', err);
            const randomImage = getRandomImage();
            await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `❌ *Error:* ${err.message || 'Failed to search images'}`
            }, { quoted: msg });
        }
    }
};