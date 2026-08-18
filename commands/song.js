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

module.exports = {
    name: 'song',
    aliases: ['music', 'audio'],
    description: 'Download songs from YouTube',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        const dest = msg.key.remoteJid;
        
        let query = args ? args.join(' ') : '';

        if (!query || query.trim() === '') {
            const randomImage = getRandomImage();
            return await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: '🎵 *Please provide a song name*\n\nExample: .song Shape of You'
            }, { quoted: msg });
        }

        try {
            const search = await ytSearch(query);
            if (!search || !search.videos || !search.videos[0]) {
                const randomImage = getRandomImage();
                return await socket.sendMessage(dest, {
                    image: { url: randomImage },
                    caption: '❌ *No results found for your query.*'
                }, { quoted: msg });
            }

            const firstVideo = search.videos[0];
            const videoId = firstVideo.videoId;
            const safeTitle = firstVideo.title.replace(/[\\/:*?"<>|]/g, '');

            const randomImage = getRandomImage();
            
            await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `⏳ *Downloading ${firstVideo.title}...*`
            }, { quoted: msg });

            // Get download link
            const apiURL = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(videoId)}&format=mp3`;
            const response = await axios.get(apiURL);
            
            if (response.status !== 200 || !response.data.downloadLink) {
                throw new Error('Failed to retrieve download link');
            }

            const fileName = `${safeTitle}.mp3`;

            // Send as audio
            await socket.sendMessage(dest, {
                audio: { url: response.data.downloadLink },
                mimetype: 'audio/mpeg',
                fileName: fileName,
                ptt: false
            }, { quoted: fakevCard });

            await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `✅ *Download complete!*\n\n🎵 ${firstVideo.title}\n⏱️ ${firstVideo.duration || 'Unknown'}\n👤 ${firstVideo.author?.name || 'Unknown'}`
            }, { quoted: msg });

        } catch (err) {
            console.error('[SONG] Error:', err);
            const randomImage = getRandomImage();
            await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `❌ *Error:* ${err.message || 'Failed to process request'}`
            }, { quoted: msg });
        }
    }
};