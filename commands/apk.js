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
    name: 'apk',
    description: 'Download APK files',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, formatBytes } = utils;
        
        try {
            const appName = args.join(' ').trim();
            if (!appName) {
                await socket.sendMessage(sender, { text: '📌 Usage: .apk <app name>\nExample: .apk whatsapp' }, { quoted: fakevCard });
                return;
            }

            await socket.sendMessage(sender, { react: { text: '⏳', key: msg.key } });

            const apiUrl = `https://api.nexoracle.com/downloader/apk?q=${encodeURIComponent(appName)}&apikey=free_key@maher_apis`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`API request failed`);

            const data = await response.json();

            if (!data || data.status !== 200 || !data.result) {
                await socket.sendMessage(sender, { text: '❌ Unable to find the APK.' }, { quoted: fakevCard });
                return;
            }

            const { name, lastup, package, size, icon, dllink } = data.result;
            if (!name || !dllink) {
                await socket.sendMessage(sender, { text: '❌ Invalid APK data.' }, { quoted: fakevCard });
                return;
            }

            const randomImage = getRandomImage();

            await socket.sendMessage(sender, {
                image: { url: icon || randomImage },
                caption: `📦 *Downloading APK*\n\n📱 ${name}\n📅 ${lastup || 'N/A'}\n📦 ${package || 'N/A'}\n📏 ${size || 'N/A'}`
            }, { quoted: fakevCard });

            const apkResponse = await fetch(dllink);
            const apkBuffer = await apkResponse.arrayBuffer();
            const buffer = Buffer.from(apkBuffer);

            await socket.sendMessage(sender, {
                document: buffer,
                mimetype: 'application/vnd.android.package-archive',
                fileName: `${name.replace(/[^a-zA-Z0-9]/g, '_')}.apk`,
                caption: `✅ *APK Downloaded*\n\n📱 ${name}`
            }, { quoted: fakevCard });

            await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
        } catch (error) {
            console.error('APK error:', error.message);
            await socket.sendMessage(sender, { text: `❌ Error: ${error.message}` }, { quoted: fakevCard });
        }
    }
};