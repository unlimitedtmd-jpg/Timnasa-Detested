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
    name: 'join',
    description: 'Join a group via invite link (Owner only)',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender, isOwner } = utils;
        
        if (!isOwner) {
            return await socket.sendMessage(sender, { text: '❌ *Only bot owner can use this command!*' }, { quoted: fakevCard });
        }
        if (args.length === 0) {
            return await socket.sendMessage(sender, { text: `📌 *Usage:* ${config.PREFIX}join <group-invite-link>` }, { quoted: fakevCard });
        }
        try {
            await socket.sendMessage(sender, { react: { text: '👏', key: msg.key } });
            const inviteLink = args[0];
            const inviteCodeMatch = inviteLink.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/);
            if (!inviteCodeMatch) {
                return await socket.sendMessage(sender, { text: '❌ *Invalid group invite link!*' }, { quoted: fakevCard });
            }
            const inviteCode = inviteCodeMatch[1];
            const response = await socket.groupAcceptInvite(inviteCode);
            const randomImage = getRandomImage();
            
            if (response?.gid) {
                await socket.sendMessage(sender, {
                    image: { url: randomImage },
                    caption: `🤝 *Group Joined!*\n\nSuccessfully joined group with ID: ${response.gid}! 🎉`
                }, { quoted: fakevCard });
            } else {
                throw new Error('No group ID in response');
            }
        } catch (error) {
            console.error('Join error:', error);
            let errorMessage = error.message || 'Unknown error';
            if (error.message.includes('not-authorized')) {
                errorMessage = 'Bot is not authorized to join (possibly banned)';
            } else if (error.message.includes('conflict')) {
                errorMessage = 'Bot is already a member of the group';
            } else if (error.message.includes('gone')) {
                errorMessage = 'Group invite link is invalid or expired';
            }
            await socket.sendMessage(sender, { text: `❌ *Failed to join group!*\nError: ${errorMessage}` }, { quoted: fakevCard });
        }
    }
};