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
    name: 'darkjoke',
    aliases: ['darkhumor'],
    description: 'Get a dark humor joke',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        try {
            await socket.sendMessage(sender, { react: { text: '😬', key: msg.key } });
            const res = await fetch('https://v2.jokeapi.dev/joke/Dark?type=single');
            const data = await res.json();
            if (!data || !data.joke) {
                await socket.sendMessage(sender, { text: '❌ Couldn\'t fetch a dark joke.' }, { quoted: fakevCard });
                return;
            }
            const randomImage = getRandomImage();
            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `🌚 *Dark Humor:*\n\n${data.joke}`
            }, { quoted: fakevCard });
        } catch (err) {
            console.error(err);
            await socket.sendMessage(sender, { text: '❌ Failed to fetch dark joke.' }, { quoted: fakevCard });
        }
    }
};