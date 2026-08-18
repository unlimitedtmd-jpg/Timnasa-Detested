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
    name: 'cricket',
    description: 'Get cricket scores and news',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, formatMessage } = utils;
        
        await socket.sendMessage(sender, { react: { text: '🏏', key: msg.key } });
        
        try {
            const response = await fetch('https://suhas-bro-api.vercel.app/news/cricbuzz');
            if (!response.ok) throw new Error('Failed to fetch cricket news');

            const data = await response.json();
            if (!data.status || !data.result) throw new Error('Invalid data');

            const { title, score, to_win, crr, link } = data.result;
            const randomImage = getRandomImage();

            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `🏏 *Cricket Update*\n\n📢 ${title}\n\n🏆 ${score}\n🎯 To Win: ${to_win}\n📈 CRR: ${crr}\n🌐 ${link}`
            }, { quoted: fakevCard });
        } catch (error) {
            console.error('Cricket error:', error);
            await socket.sendMessage(sender, { text: '⚠️ Cricket news not available.' }, { quoted: fakevCard });
        }
    }
};