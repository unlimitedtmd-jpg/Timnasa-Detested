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
    name: 'pair',
    aliases: ['code', 'getcode'],
    description: 'Generate pairing code',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
        
        try {
            await socket.sendMessage(sender, { react: { text: '📲', key: msg.key } });

            const q = msg.message?.conversation ||
                    msg.message?.extendedTextMessage?.text ||
                    msg.message?.imageMessage?.caption ||
                    msg.message?.videoMessage?.caption || '';

            const number = q.replace(/^[.\/!]pair\s*/i, '').trim();

            if (!number) {
                return await socket.sendMessage(sender, { text: '📌 *Usage:* .pair +26777821911' }, { quoted: msg });
            }

            const cleanNumber = number.replace(/[^0-9]/g, '');
            if (cleanNumber.length < 10) {
                return await socket.sendMessage(sender, { text: '❌ *Invalid number!* Example: .pair 26777821911' }, { quoted: msg });
            }

            const url = `https://shadow-test-4f50f51dc6ab.herokuapp.com/code?number=${encodeURIComponent(cleanNumber)}`;
            const response = await fetch(url);
            const result = await response.json();

            if (!result || !result.code) {
                return await socket.sendMessage(sender, { text: '❌ Failed to retrieve pairing code.' }, { quoted: msg });
            }

            const randomImage = getRandomImage();
            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `✅ *Pairing Complete!*\n\n🔑 *Your Pairing Code:* ${result.code}\n\n📱 Enter this code in WhatsApp to connect your bot.`
            }, { quoted: msg });

        } catch (err) {
            console.error("❌ Pair Command Error:", err);
            await socket.sendMessage(sender, { text: '❌ Something broke. Try again later?' }, { quoted: fakevCard });
        }
    }
};