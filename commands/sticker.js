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
    name: 'sticker',
    aliases: ['s'],
    description: 'Convert image/video to sticker',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        await socket.sendMessage(sender, { react: { text: '✨', key: msg.key } });

        try {
            let quoted = msg.quoted ? msg.quoted : msg;
            let mime = (quoted.msg || quoted).mimetype || '';

            if (!mime) {
                return socket.sendMessage(sender, { text: '⚠️ Reply with an image/video to make a sticker!' }, { quoted: msg });
            }

            if (/image|video/.test(mime)) {
                let media = await quoted.download();
                await socket.sendMessage(sender, { sticker: media }, { quoted: msg });
            } else {
                await socket.sendMessage(sender, { text: '❌ Only image or video allowed!' }, { quoted: msg });
            }
        } catch (error) {
            console.error('Sticker error:', error);
            await socket.sendMessage(sender, { text: '💔 Failed to create sticker. Try again!' }, { quoted: msg });
        }
    }
};