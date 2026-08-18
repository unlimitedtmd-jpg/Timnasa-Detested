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
    name: 'viewonce',
    aliases: ['rvo', 'vv'],
    description: 'View once messages',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        await socket.sendMessage(sender, { react: { text: '✨', key: msg.key } });

        try {
            if (!msg.quoted) {
                return await socket.sendMessage(sender, { text: `🚩 *Reply to a view-once message*\nUsage: ${config.PREFIX}vv` });
            }

            const quotedMessage = msg.quoted?.message || msg.msg?.contextInfo?.quotedMessage || null;

            if (!quotedMessage) {
                return await socket.sendMessage(sender, { text: `❌ *Can't find that message*` });
            }

            let fileType = null;
            let mediaMessage = null;
            
            if (quotedMessage.viewOnceMessageV2) {
                const mc = quotedMessage.viewOnceMessageV2.message;
                if (mc.imageMessage) { fileType = 'image'; mediaMessage = mc.imageMessage; }
                else if (mc.videoMessage) { fileType = 'video'; mediaMessage = mc.videoMessage; }
                else if (mc.audioMessage) { fileType = 'audio'; mediaMessage = mc.audioMessage; }
            } else if (quotedMessage.viewOnceMessage) {
                const mc = quotedMessage.viewOnceMessage.message;
                if (mc.imageMessage) { fileType = 'image'; mediaMessage = mc.imageMessage; }
                else if (mc.videoMessage) { fileType = 'video'; mediaMessage = mc.videoMessage; }
            } else if (quotedMessage.imageMessage?.viewOnce) {
                fileType = 'image'; mediaMessage = quotedMessage.imageMessage;
            } else if (quotedMessage.videoMessage?.viewOnce) {
                fileType = 'video'; mediaMessage = quotedMessage.videoMessage;
            } else if (quotedMessage.audioMessage?.viewOnce) {
                fileType = 'audio'; mediaMessage = quotedMessage.audioMessage;
            }

            if (!fileType || !mediaMessage) {
                return await socket.sendMessage(sender, { text: `⚠️ *Not a view-once message*` });
            }

            await socket.sendMessage(sender, { text: `🔓 *Unveiling your secret...*` });

            const mediaBuffer = await socket.downloadMediaMessage(
                { key: msg.quoted.key, message: { [fileType + 'Message']: mediaMessage } },
                'buffer',
                {}
            );

            if (!mediaBuffer) throw new Error('Failed to download');

            const opts = { caption: `✨ *Revealed ${fileType.toUpperCase()}*` };
            if (fileType === 'image') await socket.sendMessage(sender, { image: mediaBuffer, ...opts });
            else if (fileType === 'video') await socket.sendMessage(sender, { video: mediaBuffer, ...opts });
            else if (fileType === 'audio') await socket.sendMessage(sender, { audio: mediaBuffer, ...opts, mimetype: mediaMessage.mimetype || 'audio/mpeg' });

            await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
        } catch (error) {
            console.error('ViewOnce error:', error);
            await socket.sendMessage(sender, { image: { url: getRandomImage() }, caption: `❌ *Error:* ${error.message}` });
        }
    }
};