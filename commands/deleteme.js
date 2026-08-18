const fs = require('fs-extra');
const path = require('path');

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
    name: 'deleteme',
    description: 'Delete your session data',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, activeSockets, socketCreationTime } = utils;
        
        const number = sender.replace(/[^0-9]/g, '');
        const sessionPath = path.join('./session', `session_${number}`);
        
        if (fs.existsSync(sessionPath)) {
            fs.removeSync(sessionPath);
        }
        
        if (activeSockets.has(number)) {
            activeSockets.get(number).ws.close();
            activeSockets.delete(number);
            socketCreationTime.delete(number);
        }
        
        const randomImage = getRandomImage();
        
        await socket.sendMessage(sender, {
            image: { url: randomImage },
            caption: `🗑️ *Session Deleted!*\n\n✅ Your session has been successfully deleted.`
        }, { quoted: fakevCard });
    }
};