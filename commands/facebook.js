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

async function fetchFacebookInfo(url) {
    try {
        const apiUrl = `https://noobs-api.top/dipto/alldl?url=${encodeURIComponent(url)}`;
        console.log(`🔄 Fetching Facebook: ${apiUrl}`);
        
        const response = await axios.get(apiUrl, { 
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (response.status === 200 && response.data) {
            const data = response.data;
            
            let result = {
                title: data.videoTitle || data.title || data.caption || "Facebook Video",
                author: data.author || data.username || "Unknown",
                likes: data.likes || 0,
                comments: data.comments || 0,
                shares: data.shares || 0,
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
        console.error('❌ Facebook API error:', error.message);
        throw error;
    }
}

module.exports = {
    name: 'facebook',
    aliases: ['fb', 'fbdl'],
    description: 'Download Facebook videos',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        const dest = msg.key.remoteJid;
        await socket.sendMessage(sender, { react: { text: '🖇️ ', key: msg.key } });

        const url = args ? args.join(' ') : '';

        if (!url || !url.includes('facebook.com') && !url.includes('fb.com') && !url.includes('fb.watch')) {
            const randomImage = getRandomImage();
            return await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: '📘 *Please provide a Facebook URL*\n\nExample: .fb https://www.facebook.com/watch?v=xxxxx'
            }, { quoted: msg });
        }

        try {
            await socket.sendMessage(dest, { text: `⏳ *Downloading Facebook video...*` }, { quoted: msg });

            const mediaInfo = await fetchFacebookInfo(url);
            
            if (!mediaInfo.videoUrl) {
                const randomImage = getRandomImage();
                return await socket.sendMessage(dest, {
                    image: { url: randomImage },
                    caption: '❌ *No video found for this Facebook URL.*'
                }, { quoted: msg });
            }

            const infoCaption = `📘 *Facebook Video*\n\n📝 *Title:* ${mediaInfo.title}`;
            
            const randomImage = getRandomImage();
            await socket.sendMessage(dest, {
                image: { url: mediaInfo.thumbnail || randomImage },
                caption: `╭─╣ *ɴᴊᴀʙᴜʟᴏ ᴊʙ ᴍɪɴɪʙᴏᴛ* ╠⁠┈┈\n${infoCaption}`
            }, { quoted: msg });

            await socket.sendMessage(dest, {
                video: { url: mediaInfo.videoUrl },
                mimetype: 'video/mp4',
                caption: `✅ *Facebook Downloaded!*\n\n${infoCaption}`
            }, { quoted: fakevCard });

        } catch (err) {
            console.error('[FACEBOOK] Error:', err);
            const randomImage = getRandomImage();
            await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `❌ *Error:* ${err.message || 'Failed to download Facebook video'}`
            }, { quoted: msg });
        }
    }
};
