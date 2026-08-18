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
    name: 'quote',
    description: 'Get a random quote',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        try {
            await socket.sendMessage(sender, { react: { text: '🤔', key: msg.key } });
            const response = await fetch('https://api.quotable.io/random');
            const data = await response.json();
            if (!data.content) throw new Error('No quote found');
            const randomImage = getRandomImage();
            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `💭 *Quote:*\n\n"${data.content}"\n— ${data.author}`
            }, { quoted: fakevCard });
        } catch (error) {
            console.error('Quote error:', error);
            await socket.sendMessage(sender, { text: '❌ Quotes not available.' }, { quoted: fakevCard });
        }
    }
};