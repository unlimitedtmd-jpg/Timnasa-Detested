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
    name: 'whois',
    description: 'Domain WHOIS lookup',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        try {
            await socket.sendMessage(sender, { react: { text: '🔍', key: msg.key } });
            const domain = args[0];
            if (!domain) {
                await socket.sendMessage(sender, { text: '📌 Usage: .whois <domain>' }, { quoted: fakevCard });
                return;
            }
            const response = await fetch(`http://api.whois.vu/?whois=${encodeURIComponent(domain)}`);
            const data = await response.json();
            if (!data.domain) throw new Error('Domain not found');
            
            const randomImage = getRandomImage();
            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `🔍 *WHOIS Lookup*\n\n🌐 Domain: ${data.domain}\n📅 Registered: ${data.created_date || 'N/A'}\n⏰ Expires: ${data.expiry_date || 'N/A'}\n📋 Registrar: ${data.registrar || 'N/A'}\n📍 Status: ${data.status?.join(', ') || 'N/A'}`
            }, { quoted: fakevCard });
        } catch (error) {
            console.error('Whois error:', error);
            await socket.sendMessage(sender, { text: '❌ Couldn\'t find that domain!' }, { quoted: fakevCard });
        }
    }
};