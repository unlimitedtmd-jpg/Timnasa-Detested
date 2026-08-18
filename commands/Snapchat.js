const axios = require('axios');

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

async function fetchSnapchatInfo(url) {
    try {
        const apiUrl = `https://noobs-api.top/dipto/alldl?url=${encodeURIComponent(url)}`;
        console.log(`🔄 Fetching Snapchat: ${apiUrl}`);
        
        const response = await axios.get(apiUrl, { 
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (response.status === 200 && response.data) {
            const data = response.data;
            
            let result = {
                title: data.videoTitle || data.title || "Snapchat Story",
                author: data.author || data.username || "Unknown",
                thumbnail: data.imageUrl || data.thumbnail || getRandomImage(),
                videoUrl: data.result || data.video || null,
                images: data.images || [],
                raw: data
            };
            
            if (data.result) {
                result.videoUrl = data.result;
            }
            
            return result;
        }
        throw new Error('No data received from API');
    } catch (error) {
        console.error('❌ Snapchat API error:', error.message);
        throw error;
    }
}

module.exports = {
    name: 'snapchat',
    aliases: ['snap', 'sc'],
    description: 'Download Snapchat stories',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        const dest = msg.key.remoteJid;
        
        const url = args ? args.join(' ') : '';

        if (!url || !url.includes('snapchat.com')) {
            const randomImage = getRandomImage();
            return await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: '👻 *Please provide a Snapchat URL*\n\nExample: .snapchat https://www.snapchat.com/xxxxx'
            }, { quoted: msg });
        }

        try {
            await socket.sendMessage(dest, { text: `⏳ *Downloading Snapchat story...*` }, { quoted: msg });

            const mediaInfo = await fetchSnapchatInfo(url);
            
            if (!mediaInfo.videoUrl && mediaInfo.images.length === 0) {
                const randomImage = getRandomImage();
                return await socket.sendMessage(dest, {
                    image: { url: randomImage },
                    caption: '❌ *No media found for this Snapchat URL.*'
                }, { quoted: msg });
            }

            const infoCaption = `👻 *Snapchat Story*\n\n👤 *Author:* ${mediaInfo.author}`;
            
            if (mediaInfo.videoUrl) {
                await socket.sendMessage(dest, {
                    video: { url: mediaInfo.videoUrl },
                    mimetype: 'video/mp4',
                    caption: `✅ *Snapchat Downloaded!*\n\n${infoCaption}`
                }, { quoted: fakevCard });
            } else if (mediaInfo.images.length > 0) {
                for (const img of mediaInfo.images.slice(0, 5)) {
                    await socket.sendMessage(dest, {
                        image: { url: img },
                        caption: `🖼️ *Snapchat Image*\n\n${infoCaption}`
                    }, { quoted: fakevCard });
                }
            }

        } catch (err) {
            console.error('[SNAPCHAT] Error:', err);
            const randomImage = getRandomImage();
            await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `❌ *Error:* ${err.message || 'Failed to download Snapchat story'}`
            }, { quoted: msg });
        }
    }
};