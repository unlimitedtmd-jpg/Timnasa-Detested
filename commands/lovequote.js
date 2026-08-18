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
    name: 'lovequote',
    description: 'Get a romantic love quote',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        try {
            await socket.sendMessage(sender, { react: { text: '🙈', key: msg.key } });
            const res = await fetch('https://api.popcat.xyz/lovequote');
            const data = await res.json();
            if (!data || !data.quote) {
                await socket.sendMessage(sender, { text: '❌ Couldn\'t fetch love quote.' }, { quoted: fakevCard });
                return;
            }
            const randomImage = getRandomImage();
            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `❤️ *Love Quote:*\n\n"${data.quote}"`
            }, { quoted: fakevCard });
        } catch (err) {
            console.error(err);
            await socket.sendMessage(sender, { text: '❌ Failed to fetch love quote.' }, { quoted: fakevCard });
        }
    }
};