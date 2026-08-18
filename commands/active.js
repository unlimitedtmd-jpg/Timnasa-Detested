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
    name: 'active',
    description: 'Show active sessions',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, activeSockets } = utils;
        
        await socket.sendMessage(sender, { react: { text: '🔮', key: msg.key } });
        
        try {
            const activeCount = activeSockets.size;
            const activeNumbers = Array.from(activeSockets.keys()).join('\n') || 'No active members';
            const randomImage = getRandomImage();

            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `👥 *Active Members:* ${activeCount}\n\nNumbers:\n${activeNumbers}`
            }, { quoted: msg });
        } catch (error) {
            console.error('Active error:', error);
            await socket.sendMessage(sender, { text: '❌ Couldn\'t count active souls!' }, { quoted: fakevCard });
        }
    }
};