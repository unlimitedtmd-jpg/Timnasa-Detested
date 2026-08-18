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
    name: 'pickupline',
    aliases: ['pickup'],
    description: 'Get a cheesy pickup line',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        try {
            await socket.sendMessage(sender, { react: { text: '🥰', key: msg.key } });
            const res = await fetch('https://vinuxd.vercel.app/api/pickup');
            const data = await res.json();
            if (!data || !data.data) {
                await socket.sendMessage(sender, { text: '❌ Couldn\'t find a pickup line.' }, { quoted: fakevCard });
                return;
            }
            const randomImage = getRandomImage();
            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `💘 *Pickup Line:*\n\n_${data.data}_`
            }, { quoted: fakevCard });
        } catch (err) {
            console.error(err);
            await socket.sendMessage(sender, { text: '❌ Failed to fetch pickup line.' }, { quoted: fakevCard });
        }
    }
};