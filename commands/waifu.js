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
    name: 'waifu',
    description: 'Get a random anime waifu',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        try {
            await socket.sendMessage(sender, { react: { text: '🥲', key: msg.key } });
            const res = await fetch('https://api.waifu.pics/sfw/waifu');
            const data = await res.json();
            if (!data || !data.url) {
                await socket.sendMessage(sender, { text: '❌ Couldn\'t fetch waifu.' }, { quoted: fakevCard });
                return;
            }
            const randomImage = getRandomImage();
            await socket.sendMessage(sender, {
                image: { url: data.url },
                caption: `✨ *Your random waifu!*\n\n${randomImage}`
            }, { quoted: fakevCard });
        } catch (err) {
            console.error(err);
            await socket.sendMessage(sender, { text: '❌ Failed to get waifu.' }, { quoted: fakevCard });
        }
    }
};