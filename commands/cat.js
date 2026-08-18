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
    name: 'cat',
    description: 'Get a cute cat picture',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        try {
            await socket.sendMessage(sender, { react: { text: '🐱', key: msg.key } });
            const res = await fetch('https://api.thecatapi.com/v1/images/search');
            const data = await res.json();
            if (!data || !data[0]?.url) {
                await socket.sendMessage(sender, { text: '❌ Couldn\'t fetch cat.' }, { quoted: fakevCard });
                return;
            }
            await socket.sendMessage(sender, {
                image: { url: data[0].url },
                caption: '🐱 Meow~ Here\'s a cute cat!'
            }, { quoted: fakevCard });
        } catch (err) {
            console.error(err);
            await socket.sendMessage(sender, { text: '❌ Failed to fetch cat.' }, { quoted: fakevCard });
        }
    }
};