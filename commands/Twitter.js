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

async function fetchTwitterInfo(url) {
    try {
        const apiUrl = `https://noobs-api.top/dipto/alldl?url=${encodeURIComponent(url)}`;
        console.log(`🔄 Fetching Twitter: ${apiUrl}`);
        
        const response = await axios.get(apiUrl, { 
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (response.status === 200 && response.data) {
            const data = response.data;
            
            let result = {
                title: data.videoTitle || data.title || data.text || "Twitter Post",
                author: data.author || data.username || "Unknown",
                likes: data.likes || 0,
                retweets: data.retweets || 0,
                comments: data.comments || 0,
                thumbnail: data.imageUrl || data.thumbnail || getRandomImage(),
                videoUrl: data.result || data.video || null,
                audioUrl: data.audio || null,
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
        console.error('❌ Twitter API error:', error.message);
        throw error;
    }
}

module.exports = {
    name: 'twitter',
    aliases: ['x', 'twit', 'twdl'],
    description: 'Download Twitter/X videos',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        const dest = msg.key.remoteJid;
        
        const url = args ? args.join(' ') : '';

        if (!url || (!url.includes('twitter.com') && !url.includes('x.com'))) {
            const randomImage = getRandomImage();
            return await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: '🐦 *Please provide a Twitter/X URL*\n\nExample: .twitter https://twitter.com/user/status/123456789'
            }, { quoted: msg });
        }

        try {
            await socket.sendMessage(dest, { text: `⏳ *Downloading Twitter video...*` }, { quoted: msg });

            const mediaInfo = await fetchTwitterInfo(url);
            
            if (!mediaInfo.videoUrl) {
                const randomImage = getRandomImage();
                return await socket.sendMessage(dest, {
                    image: { url: randomImage },
                    caption: '❌ *No video found for this Twitter URL.*'
                }, { quoted: msg });
            }

            const infoCaption = `🐦 *Twitter/X Post*\n\n📝 *Title:* ${mediaInfo.title}\n👤 *Author:* ${mediaInfo.author}\n❤️ *Likes:* ${mediaInfo.likes}\n🔁 *Retweets:* ${mediaInfo.retweets}`;
            
            const randomImage = getRandomImage();
            await socket.sendMessage(dest, {
                image: { url: mediaInfo.thumbnail || randomImage },
                caption: `📥 *Downloading...*\n\n${infoCaption}`
            }, { quoted: msg });

            await socket.sendMessage(dest, {
                video: { url: mediaInfo.videoUrl },
                mimetype: 'video/mp4',
                caption: `✅ *Twitter Downloaded!*\n\n${infoCaption}`
            }, { quoted: fakevCard });

        } catch (err) {
            console.error('[TWITTER] Error:', err);
            const randomImage = getRandomImage();
            await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `❌ *Error:* ${err.message || 'Failed to download Twitter video'}`
            }, { quoted: msg });
        }
    }
};