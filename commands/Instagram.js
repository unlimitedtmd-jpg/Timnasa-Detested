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

// ========== FETCH INSTAGRAM INFO ==========
async function fetchInstagramInfo(url) {
    try {
        const apiUrl = `https://noobs-api.top/dipto/alldl?url=${encodeURIComponent(url)}`;
        console.log(`🔄 Fetching Instagram: ${apiUrl}`);
        
        const response = await axios.get(apiUrl, { 
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        console.log(`📡 Response status:`, response.status);
        
        if (response.status === 200 && response.data) {
            const data = response.data;
            console.log('📡 Data received:', JSON.stringify(data).substring(0, 300));
            
            let result = {
                title: data.videoTitle || data.title || data.caption || "Instagram Post",
                author: data.author || data.username || "Unknown",
                likes: data.likes || data.like_count || 0,
                comments: data.comments || data.comment_count || 0,
                thumbnail: data.imageUrl || data.thumbnail || data.cover || getRandomImage(),
                videoUrl: data.result || data.video || data.video_url || null,
                audioUrl: data.audio || null,
                images: data.images || (data.imageUrl ? [data.imageUrl] : []),
                isVideo: false,
                isCarousel: data.images && data.images.length > 1,
                raw: data
            };
            
            if (data.result && data.result.includes('.mp4')) {
                result.isVideo = true;
                result.videoUrl = data.result;
            }
            
            if (data.imageUrl && !data.result) {
                result.isVideo = false;
                result.images = [data.imageUrl];
            }
            
            console.log(`✅ Instagram data parsed: Video=${result.isVideo}, Images=${result.images.length}`);
            return result;
        }
        
        throw new Error('No data received from API');
        
    } catch (error) {
        console.error('❌ Instagram API error:', error.message);
        throw error;
    }
}

module.exports = {
    name: 'instagram',
    aliases: ['ig', 'insta', 'igdl'],
    description: 'Download Instagram posts',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        const dest = msg.key.remoteJid;
        await socket.sendMessage(sender, { react: { text: '🖇️ ', key: msg.key } });

        const url = args ? args.join(' ') : '';

        if (!url || !url.includes('instagram.com')) {
            const randomImage = getRandomImage();
            return await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: '📸 *Please provide an Instagram URL*\n\nExample: .ig https://www.instagram.com/p/xxxxx/'
            }, { quoted: msg });
        }

        try {
            const mediaInfo = await fetchInstagramInfo(url);

            if (!mediaInfo.videoUrl && mediaInfo.images.length === 0) {
                const randomImage = getRandomImage();
                return await socket.sendMessage(dest, {
                    image: { url: randomImage },
                    caption: '❌ *No media found for this Instagram URL.*'
                }, { quoted: msg });
            }

            const infoCaption = `📸 *Instagram Post*\n\n📝 *Title:* ${mediaInfo.title}\n👤 *Author:* ${mediaInfo.author}\n❤️ *Likes:* ${mediaInfo.likes}`;

            // Send options: 1. Video 2. Audio 3. Image
            const randomImage = getRandomImage();
            const optionMessage = await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `📥 *Choose download option:*\n\n1️⃣ *Video*\n2️⃣ *Audio*\n3️⃣ *Image*\n\n📌 *Reply with number 1, 2, or 3*`
            }, { quoted: msg });

            // Wait for user response
            const response = await new Promise((resolve) => {
                const listener = async (update) => {
                    const msg = update.messages[0];
                    if (!msg || !msg.message) return;
                    
                    const sender = msg.key.remoteJid;
                    const content = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
                    const num = parseInt(content);
                    
                    if (num >= 1 && num <= 3) {
                        resolve({ choice: num, msg });
                    }
                };
                
                socket.ev.on('messages.upsert', listener);
                setTimeout(() => {
                    socket.ev.off('messages.upsert', listener);
                    resolve(null);
                }, 30000);
            });

            if (!response) {
                return await socket.sendMessage(dest, { text: '⏰ *Timeout! Please try again.*' }, { quoted: msg });
            }

            const choice = response.choice;

            if (choice === 1 && mediaInfo.videoUrl) {
                await socket.sendMessage(dest, {
                    video: { url: mediaInfo.videoUrl },
                    mimetype: 'video/mp4',
                    caption: `✅ *Video Downloaded!*\n\n${infoCaption}`
                }, { quoted: fakevCard });
            } else if (choice === 2 && mediaInfo.audioUrl) {
                await socket.sendMessage(dest, {
                    audio: { url: mediaInfo.audioUrl },
                    mimetype: 'audio/mpeg'
                }, { quoted: fakevCard });
            } else if (choice === 3 && mediaInfo.images.length > 0) {
                for (const img of mediaInfo.images.slice(0, 5)) {
                    await socket.sendMessage(dest, {
                        image: { url: img },
                        caption: `🖼️ *Image*\n\n${infoCaption}`
                    }, { quoted: fakevCard });
                }
            } else {
                await socket.sendMessage(dest, { text: '❌ *Invalid choice or media not available.*' }, { quoted: msg });
            }

        } catch (err) {
            console.error('[INSTAGRAM] Error:', err);
            const randomImage = getRandomImage();
            await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `❌ *Error:* ${err.message || 'Failed to download Instagram post'}`
            }, { quoted: msg });
        }
    }
};
