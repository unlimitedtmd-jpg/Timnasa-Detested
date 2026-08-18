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
    name: 'menu',
    aliases: ['help', 'commands'],
    description: 'Show available commands',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, loadedCommands } = utils;
        
        try {
            await socket.sendMessage(sender, { react: { text: '📋', key: msg.key } });
            const randomImage = getRandomImage();

            let cmdList = '';
            const commands = Array.from(loadedCommands.keys());
            for (const cmd of commands) {
                const cmdData = loadedCommands.get(cmd);
                cmdList += `┃  • ${config.PREFIX}${cmd} - ${cmdData.description || 'No description'}\n`;
            }

            const menuText = `
╭─╣ *ɴᴊᴀʙᴜʟᴏ ᴊʙ ᴍɪɴɪʙᴏᴛ* ╠⁠┈┈⊷
*-* Bot: Njabulo JB MiniBot
*-* 📍 Prefix: *[ ${config.PREFIX} ]*
*-* 👑 Creator: Njabulo JB
*-* 📦 Commands: ${loadedCommands.size}
┗─╣ *ᴄᴏᴍᴍᴀɴᴅs ʙᴏᴛ ᴀᴄᴛɪᴠᴇ* ╠⁠┈┈

📋 *Available Commands:*
${cmdList}
            `;

            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: menuText
            }, { quoted: fakevCard });
        } catch (error) {
            console.error('Menu command error:', error);
            await socket.sendMessage(sender, { text: '❌ Failed to load menu.' }, { quoted: fakevCard });
        }
    }
};
