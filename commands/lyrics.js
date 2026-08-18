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

// ========== FETCH LYRICS - MULTIPLE APIS ==========
async function fetchLyrics(query) {
    const apis = [
        // API 1: Discard API (Primary)
        {
            url: `https://discardapi.dpdns.org/api/music/lyrics?apikey=qasim&song=${encodeURIComponent(query)}`,
            extract: (data) => {
                if (data.result && data.result.message && data.result.message.lyrics) {
                    const msg = data.result.message;
                    return {
                        title: msg.title || query,
                        artist: msg.artist || 'Unknown',
                        lyrics: msg.lyrics,
                        image: msg.image || null,
                        url: msg.url || null,
                        success: true
                    };
                }
                return null;
            }
        },
        // API 2: PopCat API
        {
            url: `https://api.popcat.xyz/lyrics?song=${encodeURIComponent(query)}`,
            extract: (data) => {
                if (data && data.lyrics) {
                    return {
                        title: data.title || query,
                        artist: data.artist || 'Unknown',
                        lyrics: data.lyrics,
                        image: data.image || null,
                        url: null,
                        success: true
                    };
                }
                return null;
            }
        },
        // API 3: Some Random API
        {
            url: `https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`,
            extract: (data) => {
                if (data && data.lyrics) {
                    return {
                        title: data.title || query,
                        artist: data.author || 'Unknown',
                        lyrics: data.lyrics,
                        image: data.thumbnail || null,
                        url: null,
                        success: true
                    };
                }
                return null;
            }
        },
        // API 4: Alternative API
        {
            url: `https://api.lyrics.ovh/v1/${encodeURIComponent(query.split(' ').slice(1).join(' '))}/${encodeURIComponent(query.split(' ')[0])}`,
            extract: (data) => {
                if (data && data.lyrics) {
                    const parts = query.split(' ');
                    return {
                        title: parts.slice(1).join(' ') || query,
                        artist: parts[0] || 'Unknown',
                        lyrics: data.lyrics,
                        image: null,
                        url: null,
                        success: true
                    };
                }
                return null;
            }
        }
    ];

    for (const api of apis) {
        try {
            console.log(`[LYRICS] Trying API: ${api.url}`);
            const response = await axios.get(api.url, { 
                timeout: 20000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            console.log(`[LYRICS] Response status: ${response.status}`);
            
            if (response.status === 200 && response.data) {
                const result = api.extract(response.data);
                if (result && result.lyrics && result.success) {
                    console.log(`[LYRICS] ✅ Got lyrics for: ${result.title}`);
                    return result;
                }
            }
        } catch (err) {
            console.log(`[LYRICS] ❌ API failed: ${err.message}`);
            if (err.response) {
                console.log(`[LYRICS] Status: ${err.response.status}`);
            }
            continue;
        }
    }
    return null;
}

// ========== SPLIT TEXT INTO CHUNKS ==========
function splitText(text, maxLength = 3800) {
    const chunks = [];
    let remaining = text;
    while (remaining.length > maxLength) {
        chunks.push(remaining.slice(0, maxLength));
        remaining = remaining.slice(maxLength);
    }
    if (remaining) chunks.push(remaining);
    return chunks;
}

module.exports = {
    name: 'lyrics',
    aliases: ['lyric', 'lirik'],
    description: 'Get song lyrics',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        const dest = msg.key.remoteJid;
        
        let query = args ? args.join(' ') : '';

        if (!query || query.trim() === '') {
            const randomImage = getRandomImage();
            return await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: '📝 *Please provide a song name*\n\nExample: .lyrics Shape of You'
            }, { quoted: msg });
        }

        try {
            const randomImage = getRandomImage();
            
            await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `⏳ *Searching lyrics for: ${query}*`
            }, { quoted: msg });

            const result = await fetchLyrics(query);
            
            if (!result || !result.lyrics) {
                return await socket.sendMessage(dest, {
                    image: { url: randomImage },
                    caption: `❌ *No lyrics found for "${query}".*\n\n💡 Try:\n.songinfo ${query}\n\nOr search on Genius:\nhttps://genius.com/search?q=${encodeURIComponent(query)}`
                }, { quoted: msg });
            }

            const title = result.title || query;
            const artist = result.artist || 'Unknown';
            const lyrics = result.lyrics;
            const image = result.image || randomImage;

            // Send song info with image
            await socket.sendMessage(dest, {
                image: { url: image },
                caption: `🎵 *${title}*\n👤 *Artist:* ${artist}\n📝 *Lyrics found!*`
            }, { quoted: fakevCard });

            // Split lyrics into chunks
            const chunks = splitText(lyrics);

            // Send lyrics chunks
            for (let i = 0; i < chunks.length; i++) {
                await socket.sendMessage(dest, {
                    text: `📝 *Lyrics (${i+1}/${chunks.length}):*\n\n${chunks[i]}`
                }, { quoted: fakevCard });
            }

            // Send success message
            await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `✅ *Lyrics sent!*\n\n🎵 ${title}\n👤 ${artist}`
            }, { quoted: msg });

        } catch (err) {
            console.error('[LYRICS] Error:', err);
            const randomImage = getRandomImage();
            
            let errorMsg = 'Failed to fetch lyrics';
            if (err.response && err.response.status === 503) {
                errorMsg = 'Lyrics service is temporarily unavailable. Please try again later.';
            } else if (err.message) {
                errorMsg = err.message;
            }
            
            await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: `❌ *Error:* ${errorMsg}\n\n💡 Try:\n.songinfo ${query || ''}\n\nOr search on Genius:\nhttps://genius.com/search?q=${encodeURIComponent(query || '')}`
            }, { quoted: msg });
        }
    }
};
