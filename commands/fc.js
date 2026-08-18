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
    name: 'fc',
    description: 'Follow a newsletter channel',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        if (args.length === 0) {
            return await socket.sendMessage(sender, {
                text: '❗ Please provide a channel JID.\n\nExample:\n.fc 120363299029326322@newsletter'
            });
        }

        const jid = args[0];
        if (!jid.endsWith("@newsletter")) {
            return await socket.sendMessage(sender, {
                text: '❗ Invalid JID. Please provide a JID ending with `@newsletter`'
            });
        }

        try {
            await socket.sendMessage(sender, { react: { text: '😌', key: msg.key } });
            const metadata = await socket.newsletterMetadata("jid", jid);
            const randomImage = getRandomImage();
            
            if (metadata?.viewer_metadata === null) {
                await socket.newsletterFollow(jid);
                await socket.sendMessage(sender, {
                    image: { url: randomImage },
                    caption: `✅ Successfully followed the channel:\n${jid}`
                });
                console.log(`FOLLOWED CHANNEL: ${jid}`);
            } else {
                await socket.sendMessage(sender, {
                    image: { url: randomImage },
                    caption: `📌 Already following the channel:\n${jid}`
                });
            }
        } catch (e) {
            console.error('❌ Error in follow channel:', e.message);
            await socket.sendMessage(sender, { text: `❌ Error: ${e.message}` });
        }
    }
};