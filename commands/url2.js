const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');

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
    name: 'tourl2',
    aliases: ['url'],
    description: 'Upload media to URL',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, formatBytes } = utils;
        
        try {
            await socket.sendMessage(sender, { react: { text: '📤', key: msg.key } });

            const quoted = msg.quoted || msg;
            const mime = quoted.mimetype || (quoted.message ? Object.keys(quoted.message)[0] : '');

            const mimeMap = {
                imageMessage: 'image/jpeg',
                videoMessage: 'video/mp4',
                audioMessage: 'audio/mp3'
            };
            const effectiveMime = mimeMap[mime] || mime;

            if (!effectiveMime || !['image', 'video', 'audio'].some(type => effectiveMime.includes(type))) {
                await socket.sendMessage(sender, { text: `❌ *Reply to image, audio, or video!*` }, { quoted: msg });
                return;
            }

            await socket.sendMessage(sender, { text: `⏳ *Uploading file...*` }, { quoted: msg });

            const buffer = await socket.downloadMediaMessage(quoted);
            if (!buffer || buffer.length === 0) throw new Error('Failed to download media');

            const ext = effectiveMime.includes('image/jpeg') ? '.jpg' :
                        effectiveMime.includes('image/png') ? '.png' :
                        effectiveMime.includes('video') ? '.mp4' :
                        effectiveMime.includes('audio') ? '.mp3' : '.bin';
            const name = `file_${Date.now()}${ext}`;
            const tmp = path.join(os.tmpdir(), name);
            fs.writeFileSync(tmp, buffer);

            const form = new FormData();
            form.append('fileToUpload', fs.createReadStream(tmp), name);
            form.append('reqtype', 'fileupload');

            const res = await axios.post('https://catbox.moe/user/api.php', form, {
                headers: form.getHeaders()
            });

            fs.unlinkSync(tmp);

            if (!res.data || res.data.includes('error')) {
                throw new Error(`Upload failed: ${res.data || 'No response'}`);
            }

            const type = effectiveMime.includes('image') ? 'Image' :
                         effectiveMime.includes('video') ? 'Video' :
                         effectiveMime.includes('audio') ? 'Audio' : 'File';

            const randomImage = getRandomImage();

            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `✅ *${type} Uploaded!*\n\n📁 Size: ${formatBytes(buffer.length)}\n🔗 URL: ${res.data}`
            }, { quoted: msg });

            await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
        } catch (error) {
            console.error('tourl2 error:', error.message);
            await socket.sendMessage(sender, { text: `❌ *Couldn't upload file!*` }, { quoted: msg });
        }
    }
};