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

// ========== FETCH TIKTOK INFO WITH MULTIPLE APIS ==========
async function fetchTikTokInfo(url) {
    const apis = [
        // Primary API
        {
            url: `https://noobs-api.top/dipto/alldl?url=${encodeURIComponent(url)}`,
            extract: (data) => {
                const result = {
                    title: data.videoTitle || data.title || data.caption || "TikTok Video",
                    author: data.author || data.username || "Unknown",
                    likes: data.likes || data.like_count || 0,
                    comments: data.comments || data.comment_count || 0,
                    shares: data.shares || data.share_count || 0,
                    thumbnail: data.imageUrl || data.thumbnail || data.cover || getRandomImage(),
                    videoUrl: data.result || data.video || data.video_url || null,
                    audioUrl: data.audio || data.music || null,
                    images: data.images || [],
                    isVideo: true
                };
                if (data.result) result.videoUrl = data.result;
                return result;
            }
        },
        // Alternative API 1 - TikWM
        {
            url: `https://api.tikwm.com/?url=${encodeURIComponent(url)}&hd=1`,
            extract: (data) => {
                if (data.data) {
                    const r = data.data;
                    return {
                        title: r.title || "TikTok Video",
                        author: r.author?.unique_id || r.author?.username || "Unknown",
                        likes: r.digg_count || 0,
                        comments: r.comment_count || 0,
                        shares: r.share_count || 0,
                        thumbnail: r.cover || r.origin_cover || getRandomImage(),
                        videoUrl: r.play || r.hdplay || null,
                        audioUrl: r.music || null,
                        images: r.images || [],
                        isVideo: true
                    };
                }
                return null;
            }
        },
        // Alternative API 2
        {
            url: `https://api.agatz.xyz/api/tiktok?url=${encodeURIComponent(url)}`,
            extract: (data) => {
                if (data.data) {
                    const r = data.data;
                    return {
                        title: r.title || r.desc || "TikTok Video",
                        author: r.author?.unique_id || r.author || "Unknown",
                        likes: r.like_count || r.digg_count || 0,
                        comments: r.comment_count || 0,
                        shares: r.share_count || 0,
                        thumbnail: r.cover || r.origin_cover || getRandomImage(),
                        videoUrl: r.play || r.video_url || null,
                        audioUrl: r.music || null,
                        images: r.images || [],
                        isVideo: true
                    };
                }
                return null;
            }
        }
    ];

    for (const api of apis) {
        try {
            console.log(`🔄 Trying TikTok API: ${api.url}`);
            const response = await axios.get(api.url, { 
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (response.status === 200 && response.data) {
                console.log(`📡 Response status: ${response.status}`);
                const result = api.extract(response.data);
                if (result && result.videoUrl) {
                    console.log(`✅ TikTok data parsed: VideoUrl=${result.videoUrl ? 'Yes' : 'No'}`);
                    return result;
                }
                // If no video, check if it has images
                if (result && result.images && result.images.length > 0) {
                    return result;
                }
            }
        } catch (error) {
            console.log(`❌ TikTok API failed: ${error.message}`);
            continue;
        }
    }
    throw new Error('All APIs failed to fetch TikTok video');
}

module.exports = {
    name: 'tiktok',
    aliases: ['tt', 'tiktokdl'],
    description: 'Download TikTok videos',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        const dest = msg.key.remoteJid;
        
        const url = args ? args.join(' ') : '';

        if (!url || !url.includes('tiktok.com')) {
            const randomImage = getRandomImage();
            return await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: '📱 *Please provide a TikTok URL*\n\nExample: .tiktok https://www.tiktok.com/@user/video/123456789'
            }, { quoted: msg });
        }

        try {
            await socket.sendMessage(dest, { 
                text: `⏳ *Downloading TikTok video...*` 
            }, { quoted: msg });

            const mediaInfo = await fetchTikTokInfo(url);
            
            const infoCaption = `📱 *TikTok Video*\n\n📝 *Title:* ${mediaInfo.title}\n👤 *Author:* ${mediaInfo.author}\n❤️ *Likes:* ${mediaInfo.likes}\n💬 *Comments:* ${mediaInfo.comments}`;
            
            const randomImage = getRandomImage();

            // Check if it's a video
            if (mediaInfo.videoUrl) {
                // Send video
                await socket.sendMessage(dest, {
                    video: { url: mediaInfo.videoUrl },
                    mimetype: 'video/mp4',
                    caption: `✅ *TikTok Downloaded!*\n\n${infoCaption}`,
                    contextInfo: {
                        externalAdReply: {
                            title: mediaInfo.title.substring(0, 100),
                            body: mediaInfo.author,
                            mediaType: 1,
                            thumbnailUrl: mediaInfo.thumbnail || randomImage,
                            renderLargerThumbnail: true,
                        }
                    }
                }, { quoted: fakevCard });
            } 
            // Check if it's images (carousel)
            else if (mediaInfo.images && mediaInfo.images.length > 0) {
                for (const img of mediaInfo.images.slice(0, 5)) {
                    await socket.sendMessage(dest, {
                        image: { url: img },
                        caption: `🖼️ *TikTok Image*\n\n${infoCaption}`
                    }, { quoted: fakevCard });
                }
            } 
            else {
                throw new Error('No media found');
            }

            // Send success message
            await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `✅ *Download Complete!*\n\n${infoCaption}`
            }, { quoted: msg });

        } catch (err) {
            console.error('[TIKTOK] Error:', err);
            const randomImage = getRandomImage();
            
            let errorMsg = 'Failed to download TikTok video';
            if (err.response && err.response.status === 500) {
                errorMsg = 'Server is busy. Please try again later.';
            } else if (err.message) {
                errorMsg = err.message;
            }
            
            await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `❌ *Error:* ${errorMsg}\n\nTry again later or check the URL.`
            }, { quoted: msg });
        }
    }
};
