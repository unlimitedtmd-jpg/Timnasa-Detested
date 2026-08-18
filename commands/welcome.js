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
    name: 'welcome',
    aliases: ['welcomemsg', 'joinmsg'],
    description: 'Manage welcome messages in groups',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, isGroup, isSenderGroupAdmin, isOwner, from, getGroupSettings, updateGroupSettings } = utils;
        
        // Check if in group
        if (!isGroup) {
            const randomImage = getRandomImage();
            return await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: '❌ *This command can only be used in groups!*'
            }, { quoted: msg });
        }

        // Check if user is admin or owner
        if (!isSenderGroupAdmin && !isOwner) {
            const randomImage = getRandomImage();
            return await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: '❌ *Only group admins or bot owner can use this command!*'
            }, { quoted: msg });
        }

        // Send reaction
        await socket.sendMessage(sender, { react: { text: '👋', key: msg.key } });

        const settings = getGroupSettings(from);
        const randomImage = getRandomImage();
        const subCmd = args[0]?.toLowerCase();

        // Show current settings
        if (!subCmd) {
            const status = settings.welcomeOn ? '🟢 ON' : '🔴 OFF';
            
            return await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `📌 *Welcome Settings*\n\nStatus: ${status}\nMessage: ${settings.welcomeMessage || config.WELCOME_MESSAGE}\n\n*Commands:*\n${config.PREFIX}welcome on - Enable welcome messages\n${config.PREFIX}welcome off - Disable welcome messages\n${config.PREFIX}welcome set <message> - Set custom welcome message\n${config.PREFIX}welcome reset - Reset to default message`
            }, { quoted: msg });
        }

        // Enable welcome
        if (subCmd === 'on') {
            updateGroupSettings(from, { welcomeOn: true });
            await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
            return await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: '✅ *Welcome messages enabled!*\n\nNew members will receive a welcome message when they join.'
            }, { quoted: msg });
        }

        // Disable welcome
        if (subCmd === 'off') {
            updateGroupSettings(from, { welcomeOn: false });
            await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } });
            return await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: '❌ *Welcome messages disabled!*\n\nNew members will not receive a welcome message.'
            }, { quoted: msg });
        }

        // Set custom welcome message
        if (subCmd === 'set') {
            const message = args.slice(1).join(' ');
            if (!message) {
                await socket.sendMessage(sender, { react: { text: '📝', key: msg.key } });
                return await socket.sendMessage(sender, {
                    image: { url: randomImage },
                    caption: `📌 *Usage:* ${config.PREFIX}welcome set <message>\n\n*Available variables:*\n{name} - User's name\n{group} - Group name\n{count} - Member count\n{number} - Phone number\n\n*Example:*\n${config.PREFIX}welcome set Welcome {name} to {group}!`
                }, { quoted: msg });
            }
            
            updateGroupSettings(from, { welcomeMessage: message });
            await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
            return await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `✅ *Welcome message updated!*\n\nNew message: ${message}`
            }, { quoted: msg });
        }

        // Reset to default
        if (subCmd === 'reset') {
            updateGroupSettings(from, { welcomeMessage: config.WELCOME_MESSAGE });
            await socket.sendMessage(sender, { react: { text: '🔄', key: msg.key } });
            return await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `✅ *Welcome message reset to default!*\n\n${config.WELCOME_MESSAGE}`
            }, { quoted: msg });
        }

        // Unknown subcommand
        await socket.sendMessage(sender, { react: { text: '❓', key: msg.key } });
        return await socket.sendMessage(sender, {
            image: { url: randomImage },
            caption: `❌ *Unknown option:* ${subCmd}\n\n*Available options:*\n${config.PREFIX}welcome on\n${config.PREFIX}welcome off\n${config.PREFIX}welcome set <message>\n${config.PREFIX}welcome reset`
        }, { quoted: msg });
    }
};
