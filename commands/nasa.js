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
    name: 'nasa',
    description: 'Get NASA space updates',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, formatMessage } = utils;
        
        try {
            await socket.sendMessage(sender, { react: { text: '🚀', key: msg.key } });
            
            const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=8vhAFhlLCDlRLzt5P1iLu2OOMkxtmScpO5VmZEjZ');
            if (!response.ok) throw new Error('Failed to fetch NASA data');
            const data = await response.json();

            if (!data.title || !data.explanation || data.media_type !== 'image') {
                throw new Error('Invalid NASA data');
            }

            const { title, explanation, date, url, copyright } = data;
            const randomImage = getRandomImage();

            await socket.sendMessage(sender, {
                image: { url: url || randomImage },
                caption: `🌌 *NASA Space Update*\n\n🌠 ${title}\n\n${explanation.substring(0, 200)}...\n\n📆 ${date}\n${copyright ? `📝 ${copyright}` : ''}`
            }, { quoted: fakevCard });
        } catch (error) {
            console.error('NASA error:', error);
            await socket.sendMessage(sender, { text: '⚠️ NASA data not available.' }, { quoted: fakevCard });
        }
    }
};