const axios = require('axios');

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
    name: 'logo',
    description: 'Generate custom logo',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, from, prefix } = utils;
        
        const q = args.join(" ");
        
        if (!q || q.trim() === '') {
            return await socket.sendMessage(sender, { text: '*`Need a name for logo`*' });
        }

        await socket.sendMessage(sender, { react: { text: '⬆️', key: msg.key } });
        
        try {
            const list = await axios.get('https://raw.githubusercontent.com/md2839pv404/anony0808/refs/heads/main/ep.json');
            
            const rows = list.data.map((v) => ({
                title: v.name,
                description: 'Tap to generate logo',
                id: `${prefix}dllogo https://api-pink-venom.vercel.app/api/logo?url=${v.url}&name=${q}`
            }));
            
            const buttonMessage = {
                buttons: [{
                    buttonId: 'action',
                    buttonText: { displayText: '🎨 Select Text Effect' },
                    type: 4,
                    nativeFlowInfo: {
                        name: 'single_select',
                        paramsJson: JSON.stringify({
                            title: 'Available Text Effects',
                            sections: [{ title: 'Choose your logo style', rows }]
                        })
                    }
                }],
                headerType: 1,
                viewOnce: true,
                caption: '❏ *Logo Maker*',
                image: { url: getRandomImage() },
            };

            await socket.sendMessage(from, buttonMessage, { quoted: fakevCard });
        } catch (err) {
            console.error('Logo error:', err);
            await socket.sendMessage(sender, { text: '❌ Failed to load logo styles.' });
        }
    }
};