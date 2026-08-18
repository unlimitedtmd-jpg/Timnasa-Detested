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
    name: 'dog',
    description: 'Get a cute dog picture',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        try {
            await socket.sendMessage(sender, { react: { text: '🦮', key: msg.key } });
            const res = await fetch('https://dog.ceo/api/breeds/image/random');
            const data = await res.json();
            if (!data || !data.message) {
                await socket.sendMessage(sender, { text: '❌ Couldn\'t fetch dog.' }, { quoted: fakevCard });
                return;
            }
            await socket.sendMessage(sender, {
                image: { url: data.message },
                caption: '🐶 Woof! Here\'s a cute dog!'
            }, { quoted: fakevCard });
        } catch (err) {
            console.error(err);
            await socket.sendMessage(sender, { text: '❌ Failed to fetch dog.' }, { quoted: fakevCard });
        }
    }
};