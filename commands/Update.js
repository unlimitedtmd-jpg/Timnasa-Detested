const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
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
                case 'commands':
                case 'reload': {
                    await socket.sendMessage(sender, {
                        text: `🔄 Reloading commands from folder...`
                    }, { quoted: fakevCard });

                    try {
                        // Clear require cache for all command files
                        const commandsPath = path.join(process.cwd(), 'commands');
                        if (fs.existsSync(commandsPath)) {
                            const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
                            let loadedCount = 0;
                            
                            for (const file of files) {
                                const filePath = path.join(commandsPath, file);
                                try {
                                    delete require.cache[require.resolve(filePath)];
                                    console.log(`🗑️ Cleared cache: ${file}`);
                                } catch (e) {
                                    console.log(`⚠️ Could not clear cache: ${file}`);
                                }
                            }
                            console.log(`🗑️ Cleared cache for ${files.length} command files`);
                        }

                        // Reload commands
                        if (typeof loadCommands === 'function') {
                            const result = await loadCommands();
                            const count = result?.size || 0;
                            
                            await socket.sendMessage(sender, {
                                image: { url: randomImage },
                                caption: `✅ *Commands Reloaded Successfully!*\n\n📦 Total commands: ${count}\n\n🔄 Type your command again to test.`
                            }, { quoted: fakevCard });
                            
                            console.log(`🔄 Commands manually reloaded: ${count} commands loaded`);
                        } else {
                            // Fallback: manually reload
                            const commandsPath = path.join(process.cwd(), 'commands');
                            if (fs.existsSync(commandsPath)) {
                                const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
                                const newCommands = new Map();
                                
                                for (const file of files) {
                                    try {
                                        const filePath = path.join(commandsPath, file);
                                        delete require.cache[require.resolve(filePath)];
                                        const command = require(filePath);
                                        if (command.name && command.execute) {
                                            newCommands.set(command.name, command);
                                        }
                                    } catch (err) {
                                        console.error(`Failed to load ${file}:`, err.message);
                                    }
                                }
                                
                                // Update loadedCommands
                                if (loadedCommands) {
                                    loadedCommands.clear();
                                    for (const [key, value] of newCommands) {
                                        loadedCommands.set(key, value);
                                    }
                                }
                                
                                await socket.sendMessage(sender, {
                                    image: { url: randomImage },
                                    caption: `✅ *Commands Reloaded Successfully!*\n\n📦 Total commands: ${newCommands.size}`
                                }, { quoted: fakevCard });
                            }
                        }
                    } catch (error) {
                        console.error('Command reload error:', error);
                        await socket.sendMessage(sender, {
                            text: `❌ *Failed to reload commands:* ${error.message}`
                        }, { quoted: fakevCard });
                    }
                    break;
                }

                case 'restart': {
                    await socket.sendMessage(sender, { 
                        text: `🔄 Restarting bot...\n\n⏳ Please wait a moment...` 
                    }, { quoted: fakevCard });
                    
                    try {
                        // Try PM2 restart first
                        const pm2Name = process.env.PM2_NAME || 'Hans-main';
                        try {
                            await execPromise(`pm2 restart ${pm2Name} --update-env`);
                            await socket.sendMessage(sender, { 
                                text: `✅ *Bot restarted successfully!*` 
                            }, { quoted: fakevCard });
                        } catch (pm2Error) {
                            // If PM2 fails, try Heroku restart
                            try {
                                await execPromise(`heroku restart -a ${process.env.HEROKU_APP_NAME || 'njabuloo-minibot'}`);
                                await socket.sendMessage(sender, { 
                                    text: `✅ *Bot restarted on Heroku!*` 
                                }, { quoted: fakevCard });
                            } catch (herokuError) {
                                // Final fallback: just reload commands
                                await socket.sendMessage(sender, { 
                                    text: `⚠️ *Restart not available. Reloading commands instead...*` 
                                }, { quoted: fakevCard });
                                
                                // Reload commands as fallback
                                if (typeof loadCommands === 'function') {
                                    await loadCommands();
                                    await socket.sendMessage(sender, { 
                                        text: `✅ *Commands reloaded!*` 
                                    }, { quoted: fakevCard });
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Restart error:', error);
                        await socket.sendMessage(sender, { 
                            text: `❌ *Restart failed:* ${error.message}\n\nTry using:\n.update commands - Reload commands only` 
                        }, { quoted: fakevCard });
                    }
                    break;
                }

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

📌 *Version:* v${config.version}

📝 *Latest Changes:*
${latestCommit.commit.message}

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

                case 'pull':
                case 'git': {
                    await socket.sendMessage(sender, { text: `⬆️ Updating from GitHub...` }, { quoted: fakevCard });
                    try {
                        const { stdout } = await execPromise('git pull origin main');
                        if (stdout.includes('Already up to date')) {
                            await socket.sendMessage(sender, { image: { url: randomImage }, caption: `✅ *Already up to date!*` }, { quoted: fakevCard });
                        } else {
                            await execPromise('npm install');
                            await socket.sendMessage(sender, { image: { url: randomImage }, caption: `✅ *Updated!*\n\n${stdout}` }, { quoted: fakevCard });
                            // Reload commands after pull
                            if (typeof loadCommands === 'function') {
                                await loadCommands();
                            }
                            await socket.sendMessage(sender, { 
                                text: `✅ *Commands reloaded after update!*` 
                            }, { quoted: fakevCard });
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
• ${config.PREFIX}update commands - Reload commands
• ${config.PREFIX}update restart - Restart
• ${config.PREFIX}update pull - Git pull` }, { quoted: fakevCard });
                }
            }
        } catch (error) {
            console.error('Update error:', error);
            await socket.sendMessage(sender, { image: { url: getRandomImage() }, caption: `❌ *Error:* ${error.message}` }, { quoted: fakevCard });
        }
    }
};
