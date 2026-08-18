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
    name: 'meme',
    description: 'Get a random meme',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        try {
            await socket.sendMessage(sender, { react: { text: '😂', key: msg.key } });
            const res = await fetch('https://meme-api.com/gimme');
            const data = await res.json();
            if (!data || !data.url) {
                await socket.sendMessage(sender, { text: '❌ Couldn\'t fetch meme.' }, { quoted: fakevCard });
                return;
            }
            await socket.sendMessage(sender, {
                image: { url: data.url },
                caption: `🤣 *${data.title}*`
            }, { quoted: fakevCard });
        } catch (err) {
            console.error(err);
            await socket.sendMessage(sender, { text: '❌ Failed to fetch meme.' }, { quoted: fakevCard });
        }
    }
};