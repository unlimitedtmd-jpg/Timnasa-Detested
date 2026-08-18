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

// ========== FETCH YOUTUBE INFO ==========
async function fetchYouTubeInfo(url) {
    try {
        const apiUrl = `https://noobs-api.top/dipto/alldl?url=${encodeURIComponent(url)}`;
        console.log(`🔄 Fetching YouTube: ${apiUrl}`);
        
        const response = await axios.get(apiUrl, { 
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        console.log(`📡 Response status: ${response.status}`);
        
        if (response.status === 200 && response.data) {
            const data = response.data;
            console.log('📡 Data received:', JSON.stringify(data).substring(0, 300));
            
            let result = {
                title: data.videoTitle || data.title || data.caption || "YouTube Video",
                author: data.author || data.channel || data.username || "Unknown",
                views: data.views || data.viewCount || 0,
                likes: data.likes || 0,
                duration: data.duration || "Unknown",
                thumbnail: data.imageUrl || data.thumbnail || data.cover || getRandomImage(),
                videoUrl: data.result || data.video || data.video_url || null,
                audioUrl: data.audio || data.audio_url || null,
                images: data.images || [],
                raw: data
            };
            
            // If there's a result URL, that's the video
            if (data.result) {
                result.videoUrl = data.result;
            }
            
            // Check if it's a carousel (multiple images)
            if (data.images && data.images.length > 1) {
                result.images = data.images;
            }
            
            // If there's an imageUrl but no video, it's an image
            if (data.imageUrl && !data.result) {
                result.images = [data.imageUrl];
            }
            
            console.log(`✅ YouTube data parsed: Video=${result.videoUrl ? 'Yes' : 'No'}, Images=${result.images.length}`);
            return result;
        }
        
        throw new Error('No data received from API');
        
    } catch (error) {
        console.error('❌ YouTube API error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
}

module.exports = {
    name: 'youtube',
    aliases: ['yt', 'ytdl'],
    description: 'Download YouTube videos, audio, or thumbnails',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        const dest = msg.key.remoteJid;
        
        let query = args ? args.join(' ') : '';

        if (!query || query.trim() === '') {
            const randomImage = getRandomImage();
            return await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: '🎬 *YouTube Downloader*\n\n*Commands:*\n.yt <song/video name> - Search and choose format\n.yt video <name> - Download video only\n.yt audio <name> - Download audio only\n.yt image <name> - Get thumbnail only\n\n*Example:*\n.yt Shape of You'
            }, { quoted: msg });
        }

        try {
            // Check if first argument is a format specifier
            let formatType = 'all';
            let searchQuery = query;
            
            const firstArg = args[0]?.toLowerCase();
            if (['video', 'mp4', 'audio', 'mp3', 'image', 'img', 'thumbnail', 'thumb'].includes(firstArg)) {
                if (['video', 'mp4'].includes(firstArg)) {
                    formatType = 'video';
                } else if (['audio', 'mp3'].includes(firstArg)) {
                    formatType = 'audio';
                } else if (['image', 'img', 'thumbnail', 'thumb'].includes(firstArg)) {
                    formatType = 'image';
                }
                searchQuery = args.slice(1).join(' ');
                
                if (!searchQuery || searchQuery.trim() === '') {
                    const randomImage = getRandomImage();
                    return await socket.sendMessage(dest, {
                        image: { url: randomImage },
                        caption: `🎬 *Please provide a search term*\n\nExample: .yt ${firstArg} Shape of You`
                    }, { quoted: msg });
                }
            }

            let videoUrl = searchQuery;
            
            // If not a URL, search YouTube
            if (!searchQuery.includes('youtube.com') && !searchQuery.includes('youtu.be')) {
                await socket.sendMessage(dest, { 
                    text: `🔍 *Searching for: ${searchQuery}*` 
                }, { quoted: msg });
                
                const search = await ytSearch(searchQuery);
                if (!search || !search.videos || search.videos.length === 0) {
                    const randomImage = getRandomImage();
                    return await socket.sendMessage(dest, {
                        image: { url: randomImage },
                        caption: '❌ *No results found for your query.*'
                    }, { quoted: msg });
                }
                videoUrl = `https://www.youtube.com/watch?v=${search.videos[0].videoId}`;
            }

            const mediaInfo = await fetchYouTubeInfo(videoUrl);
            
            if (!mediaInfo.videoUrl && mediaInfo.images.length === 0) {
                const randomImage = getRandomImage();
                return await socket.sendMessage(dest, {
                    image: { url: randomImage },
                    caption: '❌ *No media found for this URL.*'
                }, { quoted: msg });
            }

            const infoCaption = `🎬 *YouTube Video*\n\n📝 *Title:* ${mediaInfo.title}\n👤 *Channel:* ${mediaInfo.author}\n👁️ *Views:* ${mediaInfo.views}\n⏱️ *Duration:* ${mediaInfo.duration}`;
            
            const randomImage = getRandomImage();

            // If format is image, send thumbnail directly
            if (formatType === 'image') {
                if (mediaInfo.thumbnail) {
                    await socket.sendMessage(dest, {
                        image: { url: mediaInfo.thumbnail },
                        caption: `🖼️ *Thumbnail*\n\n${infoCaption}`
                    }, { quoted: fakevCard });
                } else {
                    await socket.sendMessage(dest, {
                        image: { url: randomImage },
                        caption: '❌ *No thumbnail available for this video.*'
                    }, { quoted: msg });
                }
                return;
            }

            // If format is video, download video directly
            if (formatType === 'video') {
                if (!mediaInfo.videoUrl) {
                    return await socket.sendMessage(dest, {
                        image: { url: randomImage },
                        caption: '❌ *No video download available for this URL.*'
                    }, { quoted: msg });
                }
                
                await socket.sendMessage(dest, {
                    video: { url: mediaInfo.videoUrl },
                    mimetype: 'video/mp4',
                    caption: `✅ *Video Downloaded!*\n\n${infoCaption}`,
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
                return;
            }

            // If format is audio, download audio directly
            if (formatType === 'audio') {
                if (!mediaInfo.audioUrl) {
                    return await socket.sendMessage(dest, {
                        image: { url: randomImage },
                        caption: '❌ *No audio download available for this URL.*'
                    }, { quoted: msg });
                }
                
                await socket.sendMessage(dest, {
                    audio: { url: mediaInfo.audioUrl },
                    mimetype: 'audio/mpeg',
                    fileName: `${mediaInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`,
                    ptt: false,
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
                return;
            }

            // ========== DEFAULT: ASK FORMAT ==========
            await socket.sendMessage(dest, {
                image: { url: mediaInfo.thumbnail || randomImage },
                caption: `📥 *Choose download option:*\n\n1️⃣ *Video*\n2️⃣ *Audio (MP3)*\n3️⃣ *Thumbnail (Image)*\n\n📌 *Reply with number 1, 2, or 3*\n\n${infoCaption}`
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
                        socket.ev.off('messages.upsert', listener);
                        resolve({ choice: num, msg });
                    }
                };
                
                socket.ev.on('messages.upsert', listener);
                setTimeout(() => {
                    socket.ev.off('messages.upsert', listener);
                    resolve(null);
                }, 60000);
            });

            if (!response) {
                return await socket.sendMessage(dest, { 
                    text: '⏰ *Timeout! Please try again.*' 
                }, { quoted: msg });
            }

            const choice = response.choice;

            if (choice === 1 && mediaInfo.videoUrl) {
                await socket.sendMessage(dest, {
                    video: { url: mediaInfo.videoUrl },
                    mimetype: 'video/mp4',
                    caption: `✅ *Video Downloaded!*\n\n${infoCaption}`,
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
            } else if (choice === 2 && mediaInfo.audioUrl) {
                await socket.sendMessage(dest, {
                    audio: { url: mediaInfo.audioUrl },
                    mimetype: 'audio/mpeg',
                    fileName: `${mediaInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`,
                    ptt: false,
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
            } else if (choice === 3 && mediaInfo.thumbnail) {
                await socket.sendMessage(dest, {
                    image: { url: mediaInfo.thumbnail },
                    caption: `🖼️ *Thumbnail Downloaded!*\n\n${infoCaption}`
                }, { quoted: fakevCard });
            } else {
                await socket.sendMessage(dest, { 
                    text: '❌ *Invalid choice or media not available.*' 
                }, { quoted: msg });
            }

        } catch (err) {
            console.error('[YOUTUBE] Error:', err);
            const randomImage = getRandomImage();
            
            let errorMsg = 'Failed to download YouTube video';
            if (err.response && err.response.status === 500) {
                errorMsg = 'Server is busy. Please try again later.';
            } else if (err.message) {
                errorMsg = err.message;
            }
            
            await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `❌ *Error:* ${errorMsg}`
            }, { quoted: msg });
        }
    }
};
