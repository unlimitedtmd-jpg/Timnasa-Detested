const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

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
    name: 'update',
    aliases: ['up', 'upgrade', 'refresh'],
    description: 'Update bot and commands',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, loadedCommands, loadCommands, isOwner } = utils;
        
        try {
            await socket.sendMessage(sender, { react: { text: '🔄', key: msg.key } });

            if (!isOwner) {
                await socket.sendMessage(sender, { text: `❌ *Error*: Only bot owner can use this command!` }, { quoted: fakevCard });
                return;
            }

            const action = args[0]?.toLowerCase() || 'check';
            const randomImage = getRandomImage();

            switch (action) {
                case 'check':
                case 'status': {
                    await socket.sendMessage(sender, { text: `⏳ Checking for updates...` }, { quoted: fakevCard });
                    try {
                        const repo = 'NjabuloJf/njabuloo-minibot';
                        const response = await axios.get(`https://api.github.com/repos/${repo}/commits/main`, { timeout: 10000 });
                        if (response.data && response.data.length > 0) {
                            const latestCommit = response.data[0];
                            const message = `
📊 *🔄 Bot Update*
📌 *Current Version:* v${config.version}
📝 *Changelog:* ${latestCommit.commit.message}
📅 *Date:* ${new Date(latestCommit.commit.committer.date).toLocaleString()}
🔗 *Commit:* ${latestCommit.sha.substring(0, 7)}

*Usage:* 
${config.PREFIX}update - Check
${config.PREFIX}update pull - Git pull
${config.PREFIX}update commands - Reload commands
${config.PREFIX}update restart - Restart bot`;
                            await socket.sendMessage(sender, { image: { url: randomImage }, caption: message }, { quoted: fakevCard });
                        }
                    } catch (error) {
                        await socket.sendMessage(sender, { text: `❌ *Error*: ${error.message || 'Unknown error'}` }, { quoted: fakevCard });
                    }
                    break;
                }
                case 'commands': {
                    await socket.sendMessage(sender, { text: `⬆️ Updating commands...` }, { quoted: fakevCard });
                    try {
                        if (typeof loadCommands === 'function') {
                            await loadCommands();
                            await socket.sendMessage(sender, { image: { url: randomImage }, caption: `✅ *Commands updated!*\n📦 Total: ${loadedCommands?.size || 0}` }, { quoted: fakevCard });
                        }
                    } catch (error) {
                        await socket.sendMessage(sender, { text: `❌ *Update failed*: ${error.message}` }, { quoted: fakevCard });
                    }
                    break;
                }
                case 'restart': {
                    await socket.sendMessage(sender, { text: `🔄 Restarting bot...` }, { quoted: fakevCard });
                    try {
                        const pm2Name = process.env.PM2_NAME || 'Hans-main';
                        try {
                            await execPromise(`pm2 restart ${pm2Name}`);
                        } catch { setTimeout(() => process.exit(0), 2000); }
                        await socket.sendMessage(sender, { text: `✅ *Bot restarted!*` }, { quoted: fakevCard });
                    } catch (error) {
                        await socket.sendMessage(sender, { text: `❌ *Restart failed*: ${error.message}` }, { quoted: fakevCard });
                    }
                    break;
                }
                case 'pull':
                case 'git': {
                    await socket.sendMessage(sender, { text: `⬆️ Updating from GitHub...` }, { quoted: fakevCard });
                    try {
                        const { stdout } = await execPromise('git pull origin main');
                        if (stdout.includes('Already up to date')) {
                            await socket.sendMessage(sender, { image: { url: randomImage }, caption: `✅ *Already up to date!*` }, { quoted: fakevCard });
                        } else {
                            await execPromise('npm install');
                            await socket.sendMessage(sender, { image: { url: randomImage }, caption: `✅ *Updated!*\n${stdout}` }, { quoted: fakevCard });
                            setTimeout(async () => { try { await execPromise(`pm2 restart ${process.env.PM2_NAME || 'Hans-main'}`); } catch { process.exit(0); } }, 3000);
                        }
                    } catch (error) {
                        await socket.sendMessage(sender, { text: `❌ *Update failed*: ${error.message}` }, { quoted: fakevCard });
                    }
                    break;
                }
                default: {
                    await socket.sendMessage(sender, { image: { url: randomImage }, caption: `
📊 *🔄 Bot Update*
*Usage:*
• ${config.PREFIX}update - Check
• ${config.PREFIX}update commands - Reload
• ${config.PREFIX}update restart - Restart
• ${config.PREFIX}update pull - Git pull` }, { quoted: fakevCard });
                }
            }
        } catch (error) {
            await socket.sendMessage(sender, { image: { url: getRandomImage() }, caption: `❌ *Error:* ${error.message}` }, { quoted: fakevCard });
        }
    }
};