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

module.exports = {
    name: 'weather',
    description: 'Get weather forecast for a city',
    execute: async (socket, msg, args, config, utils) => {
        const { fakevCard, sender } = utils;
        
        try {
            await socket.sendMessage(sender, { react: { text: '🌦️', key: msg.key } });

            const q = msg.message?.conversation ||
                      msg.message?.extendedTextMessage?.text ||
                      msg.message?.imageMessage?.caption ||
                      msg.message?.videoMessage?.caption || '';

            if (!q || q.trim() === '') {
                await socket.sendMessage(sender, {
                    text: `📌 *Usage:* ${config.PREFIX}weather <city>\n*Example:* ${config.PREFIX}weather London`
                }, { quoted: msg });
                return;
            }

            await socket.sendMessage(sender, { text: `⏳ *Fetching weather...*` }, { quoted: msg });

            const apiKey = '2d61a72574c11c4f36173b627f8cb177';
            const city = q.trim();
            const url = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

            const response = await axios.get(url, { timeout: 5000 });
            const data = response.data;
            const randomImage = getRandomImage();

            const weatherMessage = `
🌍 *Weather for* ${data.name}, ${data.sys.country}
🌡️ Temp: ${data.main.temp}°C (Feels like ${data.main.feels_like}°C)
🌡️ Min: ${data.main.temp_min}°C | Max: ${data.main.temp_max}°C
💧 Humidity: ${data.main.humidity}%
☁️ Weather: ${data.weather[0].main} - ${data.weather[0].description}
💨 Wind: ${data.wind.speed} m/s
🔽 Pressure: ${data.main.pressure} hPa
            `;

            await socket.sendMessage(sender, {
                image: { url: randomImage },
                caption: `🌤 *Weather Report*\n\n${weatherMessage}`
            }, { quoted: msg });

        } catch (error) {
            console.error('Weather error:', error.message);
            let errorMessage = `❌ *Couldn't fetch weather!*`;
            if (error.message.includes('404')) {
                errorMessage = `🚫 *City not found!* Please check spelling.`;
            }
            await socket.sendMessage(sender, { text: errorMessage }, { quoted: msg });
        }
    }
};