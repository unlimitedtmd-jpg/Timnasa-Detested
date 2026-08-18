const axios = require('axios');
const ytSearch = require('yt-search');

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

// ========== GET AUDIO DOWNLOAD URL - MULTIPLE APIS ==========
async function getAudioUrl(videoId) {
    const apis = [
        // API 1: Noobs API
        {
            url: `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(videoId)}&format=mp3`,
            extract: (data) => {
                return data.downloadLink || data.download_url || data.result?.downloadLink || data.result?.download_url || data.link || data.url;
            }
        },
        // API 2: Agatz API
        {
            url: `https://api.agatz.xyz/api/ytdl?url=https://youtu.be/${videoId}&type=mp3`,
            extract: (data) => {
                return data.result?.download_url || data.result?.downloadUrl || data.download_url || data.url;
            }
        },
        // API 3: Alternative
        {
            url: `https://api.davidcyriltech.my.id/download/ytdl?url=https://youtu.be/${videoId}&filter=audio`,
            extract: (data) => {
                return data.result?.downloadUrl || data.result?.download_url || data.downloadUrl || data.url;
            }
        }
    ];

    for (const api of apis) {
        try {
            console.log(`[PLAY] Trying API: ${api.url}`);
            const response = await axios.get(api.url, { 
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            console.log(`[PLAY] Response status: ${response.status}`);
            
            if (response.status === 200 && response.data) {
                const url = api.extract(response.data);
                if (url && url.startsWith('http')) {
                    console.log(`[PLAY] ✅ Got download URL: ${url.substring(0, 50)}...`);
                    return url;
                } else {
                    console.log(`[PLAY] No valid URL found in response:`, JSON.stringify(response.data).substring(0, 200));
                }
            }
        } catch (err) {
            console.log(`[PLAY] ❌ API failed: ${err.message}`);
            if (err.response) {
                console.log(`[PLAY] Status: ${err.response.status}`);
            }
            continue;
        }
    }
    return null;
}

// ========== SEARCH YOUTUBE ==========
async function searchYouTube(query) {
    try {
        const results = await ytSearch(query);
        if (!results || !results.videos || results.videos.length === 0) {
            return null;
        }
        return results.videos;
    } catch (error) {
        console.error('Search error:', error);
        return null;
    }
}

module.exports = {
    name: 'play',
    aliases: ['song', 'music', 'mp3'],
    description: 'Search and download audio from YouTube',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        const dest = msg.key.remoteJid;
        
        let query = args ? args.join(' ') : '';

        if (!query || query.trim() === '') {
            const randomImage = getRandomImage();
            return await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: '🎵 *Please provide a song name*\n\nExample: .play Shape of You'
            }, { quoted: msg });
        }

        try {
            // Send searching message
            await socket.sendMessage(dest, {
                text: `🔍 *Searching: ${query}*`
            }, { quoted: msg });

            // Search YouTube
            const videos = await searchYouTube(query);
            if (!videos || videos.length === 0) {
                const randomImage = getRandomImage();
                return await socket.sendMessage(dest, {
                    image: { url: randomImage },
                    caption: '❌ *No results found for your query.*'
                }, { quoted: msg });
            }

            const video = videos[0];
            const videoId = video.videoId;
            const title = video.title;
            const artist = video.author?.name || 'Unknown';
            const duration = video.duration || 'Unknown';
            const views = video.views ? video.views.toLocaleString() : 'Unknown';
            const thumbnail = video.thumbnail || getRandomImage();

            // Send song info
            const infoCaption = `🎵 *Title:* ${title}\n👤 *Artist:* ${artist}\n⏱️ *Duration:* ${duration}\n👁️ *Views:* ${views}`;
            
            await socket.sendMessage(dest, {
                image: { url: thumbnail },
                caption: `📥 *Downloading audio...*\n\n${infoCaption}`
            }, { quoted: msg });

            // Get download URL
            const downloadUrl = await getAudioUrl(videoId);

            if (!downloadUrl) {
                const randomImage = getRandomImage();
                return await socket.sendMessage(dest, {
                    image: { url: randomImage },
                    caption: `❌ *Failed to get download link.*\n\nPlease try again later or use:\n.song ${query}`
                }, { quoted: msg });
            }

            // ========== SEND AUDIO ==========
            await socket.sendMessage(dest, {
                audio: { url: downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: `${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`,
                ptt: false,
                contextInfo: {
                    externalAdReply: {
                        title: title.substring(0, 100),
                        body: artist,
                        mediaType: 1,
                        thumbnailUrl: thumbnail,
                        renderLargerThumbnail: true,
                    }
                }
            }, { quoted: fakevCard });

            // Send success message
            const randomImage = getRandomImage();
            await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `✅ *Audio Downloaded!*\n\n🎵 ${title}\n👤 ${artist}\n⏱️ ${duration}`
            }, { quoted: msg });

        } catch (err) {
            console.error('[PLAY] Error:', err);
            const randomImage = getRandomImage();
            
            let errorMsg = 'Failed to process request';
            if (err.response && err.response.status === 500) {
                errorMsg = 'Server is busy. Please try again later.';
            } else if (err.message) {
                errorMsg = err.message;
            }
            
            await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `❌ *Error:* ${errorMsg}\n\nTry using:\n.song ${query || ''}`
            }, { quoted: msg });
        }
    }
};
