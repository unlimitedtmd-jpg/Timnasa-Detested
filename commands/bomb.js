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
    name: 'bomb',
    description: 'Send multiple messages to a number',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, delay } = utils;
        
        await socket.sendMessage(sender, { react: { text: '🔥', key: msg.key } });
        
        const q = msg.message?.conversation ||
                  msg.message?.extendedTextMessage?.text || '';
        const [target, text, countRaw] = q.split(',').map(x => x?.trim());

        const count = parseInt(countRaw) || 5;

        if (!target || !text || !count) {
            return await socket.sendMessage(sender, {
                text: '📌 *Usage:* .bomb <number>,<message>,<count>\n\nExample:\n.bomb 26777821911,Hello 👋,5'
            }, { quoted: msg });
        }

        const jid = `${target.replace(/[^0-9]/g, '')}@s.whatsapp.net`;

        if (count > 20) {
            return await socket.sendMessage(sender, {
                text: '❌ *Max 20 messages per bomb!*'
            }, { quoted: msg });
        }

        for (let i = 0; i < count; i++) {
            await socket.sendMessage(jid, { text });
            await delay(700);
        }

        const randomImage = getRandomImage();

        await socket.sendMessage(sender, {
            image: { url: randomImage },
            caption: `✅ *Bomb sent to ${target} — ${count}!* 💣`
        }, { quoted: fakevCard });
    }
};