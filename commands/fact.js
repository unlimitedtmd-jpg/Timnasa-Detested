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
    name: 'fact',
    description: 'Get a random fact',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        try {
            await socket.sendMessage(sender, { react: { text: '😑', key: msg.key } });
            const res = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
            const data = await res.json();
            if (!data || !data.text) {
                await socket.sendMessage(sender, { text: '❌ Couldn\'t fetch a fact.' }, { quoted: fakevCard });
                return;
            }
            const randomImage = getRandomImage();
            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `💡 *Random Fact:*\n\n${data.text}`
            }, { quoted: fakevCard });
        } catch (err) {
            console.error(err);
            await socket.sendMessage(sender, { text: '❌ Couldn\'t fetch a fact.' }, { quoted: fakevCard });
        }
    }
};