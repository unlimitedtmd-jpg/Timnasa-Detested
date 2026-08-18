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
    name: 'goodbye',
    aliases: ['goodbyemsg', 'leavemsg'],
    description: 'Manage goodbye messages in groups',
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
            const status = settings.goodbyeOn ? '🟢 ON' : '🔴 OFF';
            
            return await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `📌 *Goodbye Settings*\n\nStatus: ${status}\nMessage: ${settings.goodbyeMessage || config.GOODBYE_MESSAGE}\n\n*Commands:*\n${config.PREFIX}goodbye on - Enable goodbye messages\n${config.PREFIX}goodbye off - Disable goodbye messages\n${config.PREFIX}goodbye set <message> - Set custom goodbye message\n${config.PREFIX}goodbye reset - Reset to default message`
            }, { quoted: msg });
        }

        // Enable goodbye
        if (subCmd === 'on') {
            updateGroupSettings(from, { goodbyeOn: true });
            await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
            return await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: '✅ *Goodbye messages enabled!*\n\nMembers will receive a goodbye message when they leave.'
            }, { quoted: msg });
        }

        // Disable goodbye
        if (subCmd === 'off') {
            updateGroupSettings(from, { goodbyeOn: false });
            await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } });
            return await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: '❌ *Goodbye messages disabled!*\n\nMembers will not receive a goodbye message.'
            }, { quoted: msg });
        }

        // Set custom goodbye message
        if (subCmd === 'set') {
            const message = args.slice(1).join(' ');
            if (!message) {
                await socket.sendMessage(sender, { react: { text: '📝', key: msg.key } });
                return await socket.sendMessage(sender, {
                    image: { url: randomImage },
                    caption: `📌 *Usage:* ${config.PREFIX}goodbye set <message>\n\n*Available variables:*\n{name} - User's name\n{group} - Group name\n{number} - Phone number\n\n*Example:*\n${config.PREFIX}goodbye set Goodbye {name}! We will miss you.`
                }, { quoted: msg });
            }
            
            updateGroupSettings(from, { goodbyeMessage: message });
            await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
            return await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `✅ *Goodbye message updated!*\n\nNew message: ${message}`
            }, { quoted: msg });
        }

        // Reset to default
        if (subCmd === 'reset') {
            updateGroupSettings(from, { goodbyeMessage: config.GOODBYE_MESSAGE });
            await socket.sendMessage(sender, { react: { text: '🔄', key: msg.key } });
            return await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `✅ *Goodbye message reset to default!*\n\n${config.GOODBYE_MESSAGE}`
            }, { quoted: msg });
        }

        // Unknown subcommand
        await socket.sendMessage(sender, { react: { text: '❓', key: msg.key } });
        return await socket.sendMessage(sender, {
            image: { url: randomImage },
            caption: `❌ *Unknown option:* ${subCmd}\n\n*Available options:*\n${config.PREFIX}goodbye on\n${config.PREFIX}goodbye off\n${config.PREFIX}goodbye set <message>\n${config.PREFIX}goodbye reset`
        }, { quoted: msg });
    }
};
