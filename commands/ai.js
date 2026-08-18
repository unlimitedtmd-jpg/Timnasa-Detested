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

// ========== AI APIS ==========
const AI_APIS = [
    async (q) => {
        const url = `https://mistral.stacktoy.workers.dev/?apikey=Suhail&text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(url, { timeout: 15000 });
        return data?.data?.response || null;
    },
    async (q) => {
        const url = `https://llama.gtech-apiz.workers.dev/?apikey=Suhail&text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(url, { timeout: 15000 });
        return data?.data?.response || data?.response || null;
    },
    async (q) => {
        const url = `https://mistral.gtech-apiz.workers.dev/?apikey=Suhail&text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(url, { timeout: 15000 });
        return data?.data?.response || data?.response || null;
    }
];

// ========== AI FETCHER WITH FALLBACK ==========
const askAI = async (query) => {
    for (const api of AI_APIS) {
        try {
            console.log(`🔄 Trying AI API...`);
            const response = await api(query);
            if (response && typeof response === 'string' && response.trim().length > 0) {
                console.log(`✅ AI API Success!`);
                return response.trim();
            }
        } catch (error) {
            console.log(`❌ AI API failed: ${error.message}`);
            continue;
        }
    }
    return "⚠️ AI service is currently unavailable. Please try again later.";
};

// ========== SEND AI RESPONSE ==========
async function sendAIResponse(socket, dest, text, fakevCard) {
    const randomImage = getRandomImage();
    
    // Split long response
    const chunks = [];
    let remaining = text;
    while (remaining.length > 3800) {
        chunks.push(remaining.slice(0, 3800));
        remaining = remaining.slice(3800);
    }
    if (remaining) chunks.push(remaining);

    // Send first chunk with image
    await socket.sendMessage(dest, {
        image: { url: randomImage },
        caption: `🤖 *AI Response:*\n\n${chunks[0]}`
    }, { quoted: fakevCard });

    // Send remaining chunks
    for (let i = 1; i < chunks.length; i++) {
        await socket.sendMessage(dest, {
            text: `📝 *Part ${i+1}/${chunks.length}:*\n\n${chunks[i]}`
        }, { quoted: fakevCard });
    }
}

// ========== COMMAND HANDLER ==========
async function handleAICommand(socket, msg, args, config, utils) {
    const { fakevCard, sender } = utils;
    const dest = msg.key.remoteJid;
    
    let query = args ? args.join(' ') : '';

    if (!query || query.trim() === '') {
        const randomImage = getRandomImage();
        return await socket.sendMessage(dest, {
            image: { url: randomImage },
            caption: `🤖 *Please ask me something*\n\nExample: .ai What is artificial intelligence?`
        }, { quoted: msg });
    }

    try {
        const randomImage = getRandomImage();
        
        await socket.sendMessage(dest, {
            image: { url: randomImage },
            caption: `🧠 *Thinking...*`
        }, { quoted: msg });
      await socket.sendMessage(sender, { react: { text: 🤖 ', key: msg.key } });

        const response = await askAI(query);

        if (!response || response.includes("unavailable")) {
            return await socket.sendMessage(dest, {
                image: { url: randomImage },
                caption: '❌ *AI service is currently unavailable. Please try again later.*'
            }, { quoted: msg });
        }

        await sendAIResponse(socket, dest, response, fakevCard);

    } catch (err) {
        console.error('[AI] Error:', err);
        const randomImage = getRandomImage();
        await socket.sendMessage(dest, {
            image: { url: randomImage },
            caption: `❌ *Error:* ${err.message || 'Failed to get AI response'}`
        }, { quoted: msg });
    }
}

// ========== EXPORT SINGLE COMMAND WITH ALIASES ==========
module.exports = {
    name: 'ai',
    aliases: [
        'artificial', 'intelligence', 
        'chat', 'chatbot',
        'njabulo', 'njabulbot',
        'gpt', 'openai',
        'gptmini', 'tinygpt',
        'gemini', 'gemini4', 'geminiai', 'googleai',
        'ilama', 'metallama',
        'ask', 'askme',
        'assistant',
        'intelligent', 'smartai',
        'quickai',
        'pro', 'aipro',
        'ultra', 'ultraai',
    ],
    description: 'Chat with AI assistant (supports 17+ aliases)',
    execute: async (socket, msg, args, config, utils) => {
        await handleAICommand(socket, msg, args, config, utils);
    }
};
