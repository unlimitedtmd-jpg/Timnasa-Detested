const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const router = express.Router();
const pino = require('pino');
const cheerio = require('cheerio');
const { Octokit } = require('@octokit/rest');
const moment = require('moment-timezone');
const Jimp = require('jimp');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require("form-data");
const os = require('os'); 
const { sms, downloadMediaMessage } = require("./msg");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    getContentType,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser,
    downloadContentFromMessage,
    proto,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    S_WHATSAPP_NET
} = require('@whiskeysockets/baileys');

// ========== IMPORT LANGUAGE CONFIG ==========
const { 
    LANGUAGES, 
    LANGUAGE_PATTERNS, 
    getLanguageName, 
    detectLanguage, 
    getSupportedLanguages,
    isLanguageSupported,
    getLanguageFromCommand 
} = require('./lang.js');

// ========== GOOGLE TRANSLATE API ==========
let translateText = async (text, targetLang) => {
    try {
        if (!targetLang || targetLang === 'en') return text;
        if (!text) return text;
        try {
            const { translate } = require('@vitalets/google-translate-api');
            const result = await translate(text, { to: targetLang });
            return result.text;
        } catch (e) {
            console.log('⚠️ Google Translate failed, using fallback...');
            try {
                const response = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`, {
                    timeout: 5000
                });
                if (response.data && response.data.responseData) {
                    return response.data.responseData.translatedText || text;
                }
                return text;
            } catch (fallbackError) {
                console.error('⚠️ Fallback translation failed:', fallbackError.message);
                return text;
            }
        }
    } catch (error) {
        console.error('⚠️ Translation error:', error.message);
        return text;
    }
};

// ========== TRANSLATION CACHE ==========
const translationCache = new Map();

let translateTextWithCache = async (text, targetLang) => {
    if (!targetLang || targetLang === 'en') return text;
    if (!text) return text;
    
    const cacheKey = `${text}_${targetLang}`;
    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
    }
    
    try {
        const result = await translateText(text, targetLang);
        translationCache.set(cacheKey, result);
        setTimeout(() => translationCache.delete(cacheKey), 3600000);
        return result;
    } catch (error) {
        console.error('⚠️ Translation error:', error.message);
        return text;
    }
};

// ========== CONFIG ==========
const config = {
    AUTO_VIEW_STATUS: 'true',
    AUTO_LIKE_STATUS: 'true',
    AUTO_RECORDING: 'true',
    AUTO_LIKE_EMOJI: ['💋', '😶', '✨️', '💗', '🎈', '🎉', '🥳', '❤️', '🧫', '🐭'],
    PREFIX: '.',
    MAX_RETRIES: 3,
    IMAGE_PATH: 'https://raw.githubusercontent.com/NjabuloJf/njabulo-data/main/njabuloimg/njabuloimg3.png',
    GROUP_INVITE_LINK: 'https://chat.whatsapp.com/HFUKihXr4qp9TjWiGATE8h?mode=ems_copy_t',
    ADMIN_LIST_PATH: './admin.json',
    RCD_IMAGE_PATH: 'https://raw.githubusercontent.com/NjabuloJf/njabulo-data/main/njabuloimg/njabuloimg3.png',
    NEWSLETTER_JID: '120363352087070233@newsletter',
    NEWSLETTER_MESSAGE_ID: '428',
    OTP_EXPIRY: 300000,
    version: '1.0.0',
    OWNER_NUMBER: '255753668403',
    BOT_FOOTER: '> Made by HansTz',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029VasiOoR3bbUw5aV4qB31',
    BOT_NAME: 'njabulomini-bot',
    LANGUAGE: 'en'
};

// ========== TRANSLATED TEXT FUNCTION ==========
async function getTranslatedTexts() {
    const lang = config.LANGUAGE || "en";
    return {
        WELCOME: await translateTextWithCache("Welcome to Hans-XMD Mini Bot", lang),
        CONNECTED: await translateTextWithCache("Successfully connected", lang),
        ERROR: await translateTextWithCache("Error", lang),
        UNKNOWN: await translateTextWithCache("Unknown command", lang),
        USAGE: await translateTextWithCache("Usage", lang),
        EXAMPLE: await translateTextWithCache("Example", lang),
        TRY_AGAIN: await translateTextWithCache("Try again later", lang),
        PROCESSING: await translateTextWithCache("Processing", lang),
        SUCCESS: await translateTextWithCache("Success", lang),
        FAILED: await translateTextWithCache("Failed", lang),
        WAIT: await translateTextWithCache("Please wait", lang),
        LANGUAGE_SETTINGS: await translateTextWithCache("Language Settings", lang),
        CURRENT_LANGUAGE: await translateTextWithCache("Current Language", lang),
        AVAILABLE_LANGUAGES: await translateTextWithCache("Available Languages", lang),
        LANGUAGE_CHANGED: await translateTextWithCache("Language Changed", lang),
        LANGUAGE_SET_TO: await translateTextWithCache("Language set to", lang),
        ALL_RESPONSES: await translateTextWithCache("All responses will now be in this language", lang),
        LANGUAGE_NOT_FOUND: await translateTextWithCache("Language not found", lang),
        ALIVE_TITLE: await translateTextWithCache("Bot is Alive", lang),
        UPTIME: await translateTextWithCache("Uptime", lang),
        ACTIVE_BOTS: await translateTextWithCache("Active Bots", lang),
        VERSION: await translateTextWithCache("Version", lang),
        MEMORY_USAGE: await translateTextWithCache("Memory Usage", lang),
        RESPONSE_TIME: await translateTextWithCache("Response Time", lang),
        MENU_TITLE: await translateTextWithCache("Bot Menu", lang),
        COMMANDS: await translateTextWithCache("Available Commands", lang),
        SELECT_CATEGORY: await translateTextWithCache("Select a category", lang),
        GENERAL_COMMANDS: await translateTextWithCache("General Commands", lang),
        MEDIA_TOOLS: await translateTextWithCache("Media Tools", lang),
        GROUP_SETTINGS: await translateTextWithCache("Group Settings", lang),
        FUN_COMMANDS: await translateTextWithCache("Fun & Entertainment", lang),
        BOT_NAME_LABEL: await translateTextWithCache("Bot Name", lang),
        CREATOR: await translateTextWithCache("Creator", lang),
        DESCRIPTION: await translateTextWithCache("Description", lang),
        PREFIX_LABEL: await translateTextWithCache("Prefix", lang),
        PING_TITLE: await translateTextWithCache("Ping", lang),
        PINGING: await translateTextWithCache("Pinging to server", lang),
        SPEED: await translateTextWithCache("Speed", lang),
        QUALITY: await translateTextWithCache("Quality", lang),
        CONNECTION_STATUS: await translateTextWithCache("Connection Status", lang),
        EXCELLENT: await translateTextWithCache("Excellent", lang),
        GOOD: await translateTextWithCache("Good", lang),
        FAIR: await translateTextWithCache("Fair", lang),
        POOR: await translateTextWithCache("Poor", lang),
        PAIR_TITLE: await translateTextWithCache("Pairing Code", lang),
        PAIR_COMPLETE: await translateTextWithCache("Pairing Complete", lang),
        YOUR_CODE: await translateTextWithCache("Your Pairing Code", lang),
        INVALID_NUMBER: await translateTextWithCache("Invalid number provided", lang),
        VIEWONCE_TITLE: await translateTextWithCache("View Once Message", lang),
        VIEWONCE_REPLY: await translateTextWithCache("Reply to a view-once message", lang),
        VIEWONCE_USAGE: await translateTextWithCache("How to use", lang),
        VIEWONCE_REVEAL: await translateTextWithCache("Revealing your secret", lang),
        VIEWONCE_NOT_FOUND: await translateTextWithCache("This is not a view-once message", lang),
        VIEWONCE_ERROR: await translateTextWithCache("Failed to reveal view-once message", lang),
        VIEWONCE_EXPIRED: await translateTextWithCache("Message expired", lang),
        SONG: await translateTextWithCache("Song", lang),
        VIDEO: await translateTextWithCache("Video", lang),
        DOWNLOADING: await translateTextWithCache("Downloading", lang),
        NOT_FOUND: await translateTextWithCache("Not found", lang),
        TITLE: await translateTextWithCache("Title", lang),
        ARTIST: await translateTextWithCache("Artist", lang),
        DURATION: await translateTextWithCache("Duration", lang),
        VIEWS: await translateTextWithCache("Views", lang),
        UPLOADED: await translateTextWithCache("Uploaded", lang),
        AI_TITLE: await translateTextWithCache("AI Assistant", lang),
        ASK_ME: await translateTextWithCache("Ask me something", lang),
        AI_RESPONSE: await translateTextWithCache("AI Response", lang),
        GROUP_ONLY: await translateTextWithCache("This command can only be used in groups", lang),
        ADMIN_ONLY: await translateTextWithCache("Only group admins can use this command", lang),
        OWNER_ONLY: await translateTextWithCache("Only bot owner can use this command", lang),
        MEMBER_ADDED: await translateTextWithCache("Member added successfully", lang),
        MEMBER_REMOVED: await translateTextWithCache("Member removed successfully", lang),
        ADMIN_PROMOTED: await translateTextWithCache("Member promoted to admin", lang),
        ADMIN_DEMOTED: await translateTextWithCache("Admin demoted to member", lang),
        GROUP_OPENED: await translateTextWithCache("Group opened for all members", lang),
        GROUP_CLOSED: await translateTextWithCache("Group closed for non-admins", lang),
        TAG_ALL: await translateTextWithCache("Tag All Members", lang),
        GROUP_LINK: await translateTextWithCache("Group Link", lang),
        WEATHER_TITLE: await translateTextWithCache("Weather Report", lang),
        TEMPERATURE: await translateTextWithCache("Temperature", lang),
        HUMIDITY: await translateTextWithCache("Humidity", lang),
        WIND_SPEED: await translateTextWithCache("Wind Speed", lang),
        PRESSURE: await translateTextWithCache("Pressure", lang),
        FEELS_LIKE: await translateTextWithCache("Feels Like", lang),
        MIN_TEMP: await translateTextWithCache("Min Temperature", lang),
        MAX_TEMP: await translateTextWithCache("Max Temperature", lang),
        CITY_NOT_FOUND: await translateTextWithCache("City not found", lang),
        JOKE_TITLE: await translateTextWithCache("Random Joke", lang),
        DARK_HUMOR: await translateTextWithCache("Dark Humor", lang),
        PICKUP_LINE: await translateTextWithCache("Pickup Line", lang),
        ROAST: await translateTextWithCache("Roast", lang),
        LOVE_QUOTE: await translateTextWithCache("Love Quote", lang),
        QUOTE_TITLE: await translateTextWithCache("Quote", lang),
        FACT_TITLE: await translateTextWithCache("Random Fact", lang),
        PROFILE_INFO: await translateTextWithCache("Profile Info", lang),
        PHONE_NUMBER: await translateTextWithCache("Phone Number", lang),
        ACCOUNT_TYPE: await translateTextWithCache("Account Type", lang),
        PERSONAL: await translateTextWithCache("Personal", lang),
        BUSINESS: await translateTextWithCache("Business", lang),
        ABOUT: await translateTextWithCache("About", lang),
        LAST_SEEN: await translateTextWithCache("Last Seen", lang),
        PROFILE_PICTURE: await translateTextWithCache("Profile Picture", lang),
        NEWS_TITLE: await translateTextWithCache("Latest News", lang),
        CRICKET_TITLE: await translateTextWithCache("Cricket News", lang),
        NASA_TITLE: await translateTextWithCache("NASA Space Update", lang),
        GOSSIP_TITLE: await translateTextWithCache("Gossip News", lang),
        SHORT_URL: await translateTextWithCache("Short URL", lang),
        ORIGINAL_URL: await translateTextWithCache("Original URL", lang),
        SHORTENED_URL: await translateTextWithCache("Shortened URL", lang),
        INVALID_URL: await translateTextWithCache("Invalid URL provided", lang),
        URL_TOO_LONG: await translateTextWithCache("URL too long", lang),
        APK_TITLE: await translateTextWithCache("APK Download", lang),
        APP_NAME: await translateTextWithCache("App Name", lang),
        PACKAGE_NAME: await translateTextWithCache("Package Name", lang),
        LAST_UPDATE: await translateTextWithCache("Last Update", lang),
        FILE_SIZE: await translateTextWithCache("File Size", lang),
        STICKER_TITLE: await translateTextWithCache("Sticker Maker", lang),
        REPLY_IMAGE: await translateTextWithCache("Reply with an image or video", lang),
        IMAGE_ONLY: await translateTextWithCache("Only image or video allowed", lang),
        STICKER_CREATED: await translateTextWithCache("Sticker created successfully", lang),
        UPLOAD_TITLE: await translateTextWithCache("File Upload", lang),
        UPLOADING: await translateTextWithCache("Uploading file", lang),
        UPLOAD_SUCCESS: await translateTextWithCache("File uploaded successfully", lang),
        UPLOAD_FAILED: await translateTextWithCache("Failed to upload file", lang),
        REPLY_MEDIA: await translateTextWithCache("Reply with image, audio, or video", lang),
        STATUS_SAVED: await translateTextWithCache("Status saved successfully", lang),
        REPLY_STATUS: await translateTextWithCache("Reply to a status to save it", lang),
        LOGO_TITLE: await translateTextWithCache("Logo Maker", lang),
        LOGO_NAME: await translateTextWithCache("Enter a name for logo", lang),
        SELECT_STYLE: await translateTextWithCache("Select logo style", lang),
        BOMB_TITLE: await translateTextWithCache("Message Bomb", lang),
        BOMB_USAGE: await translateTextWithCache("Number, message, count", lang),
        MAX_MESSAGES: await translateTextWithCache("Maximum 20 messages per bomb", lang),
        BOMB_SENT: await translateTextWithCache("Bomb sent successfully", lang),
        SESSION_DELETED: await translateTextWithCache("Session deleted successfully", lang),
        REPLY_USAGE: await translateTextWithCache("Reply to a message to use this command", lang),
        MENTION_USER: await translateTextWithCache("Mention a user", lang),
        PROVIDE_TEXT: await translateTextWithCache("Provide text", lang),
        POWERED_BY: await translateTextWithCache("Powered by Hans-Tech", lang),
        MADE_BY: await translateTextWithCache("Made by", lang),
        BOT_CONNECTED: await translateTextWithCache("Bot Connected Successfully ✅", lang),
        CONNECTION_STATUS: await translateTextWithCache("Connection Status", lang),
        ONLINE: await translateTextWithCache("Online", lang)
    };
}

const octokit = new Octokit({ 
    auth: process.env.GITHUB_TOKEN || 'Ve7nyoWuYsZMIVT403m2Lctqejy90jF3h5' 
});
const owner = 'NjabuloJf';
const repo = 'njabuloo-minibot';

const activeSockets = new Map();
const socketCreationTime = new Map();
const SESSION_BASE_PATH = './session';
const NUMBER_LIST_PATH = './numbers.json';
const otpStore = new Map();
const COMMANDS_PATH = './commands';

if (!fs.existsSync(SESSION_BASE_PATH)) {
    fs.mkdirSync(SESSION_BASE_PATH, { recursive: true });
}

if (!fs.existsSync(COMMANDS_PATH)) {
    fs.mkdirSync(COMMANDS_PATH, { recursive: true });
}

// Load commands from commands folder
let loadedCommands = new Map();

async function loadCommands() {
    try {
        const commandFiles = fs.readdirSync(COMMANDS_PATH).filter(file => file.endsWith('.js'));
        loadedCommands.clear();
        
        for (const file of commandFiles) {
            try {
                const command = require(path.join(process.cwd(), COMMANDS_PATH, file));
                if (command.name && command.execute) {
                    loadedCommands.set(command.name, command);
                    console.log(`✅ Loaded command: ${command.name}`);
                }
            } catch (err) {
                console.error(`❌ Failed to load command from ${file}:`, err.message);
            }
        }
        console.log(`📦 Total commands loaded: ${loadedCommands.size}`);
        return loadedCommands;
    } catch (err) {
        console.error('❌ Failed to load commands:', err.message);
        return loadedCommands;
    }
}

// Initial load
loadCommands();

// Auto-reload commands every 30 seconds
setInterval(() => {
    loadCommands().catch(err => console.error('Command reload error:', err));
}, 30000);

function loadAdmins() {
    try {
        if (fs.existsSync(config.ADMIN_LIST_PATH)) {
            return JSON.parse(fs.readFileSync(config.ADMIN_LIST_PATH, 'utf8'));
        }
        return [];
    } catch (error) {
        console.error('Failed to load admin list:', error);
        return [];
    }
}

function formatMessage(title, content, footer) {
    return `*${title}*\n\n${content}\n\n> *${footer}*`;
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function getSriLankaTimestamp() {
    return moment().tz('Africa/Nairobi').format('YYYY-MM-DD HH:mm:ss');
}

async function cleanDuplicateFiles(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: 'session'
        });

        const sessionFiles = data.filter(file => 
            file.name.startsWith(`empire_${sanitizedNumber}_`) && file.name.endsWith('.json')
        ).sort((a, b) => {
            const timeA = parseInt(a.name.match(/empire_\d+_(\d+)\.json/)?.[1] || 0);
            const timeB = parseInt(b.name.match(/empire_\d+_(\d+)\.json/)?.[1] || 0);
            return timeB - timeA;
        });

        const configFiles = data.filter(file => 
            file.name === `config_${sanitizedNumber}.json`
        );

        if (sessionFiles.length > 1) {
            for (let i = 1; i < sessionFiles.length; i++) {
                await octokit.repos.deleteFile({
                    owner,
                    repo,
                    path: `session/${sessionFiles[i].name}`,
                    message: `Delete duplicate session file for ${sanitizedNumber}`,
                    sha: sessionFiles[i].sha
                });
                console.log(`Deleted duplicate session file: ${sessionFiles[i].name}`);
            }
        }

        if (configFiles.length > 0) {
            console.log(`Config file for ${sanitizedNumber} already exists`);
        }
    } catch (error) {
        console.error(`Failed to clean duplicate files for ${number}:`, error);
    }
}

async function joinGroup(socket) {
    let retries = config.MAX_RETRIES || 3;
    let inviteCode = 'CehDJZixGGA2LBA7EgUGaL';
    if (config.GROUP_INVITE_LINK) {
        const cleanInviteLink = config.GROUP_INVITE_LINK.split('?')[0];
        const inviteCodeMatch = cleanInviteLink.match(/chat\.whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9_-]+)/);
        if (!inviteCodeMatch) {
            console.error('Invalid group invite link format:', config.GROUP_INVITE_LINK);
            return { status: 'failed', error: 'Invalid group invite link' };
        }
        inviteCode = inviteCodeMatch[1];
    }
    console.log(`Attempting to join group with invite code: ${inviteCode}`);

    while (retries > 0) {
        try {
            const response = await socket.groupAcceptInvite(inviteCode);
            console.log('Group join response:', JSON.stringify(response, null, 2));
            if (response?.gid) {
                console.log(`[ ✅ ] Successfully joined group with ID: ${response.gid}`);
                return { status: 'success', gid: response.gid };
            }
            throw new Error('No group ID in response');
        } catch (error) {
            retries--;
            let errorMessage = error.message || 'Unknown error';
            if (error.message.includes('not-authorized')) {
                errorMessage = 'Bot is not authorized to join (possibly banned)';
            } else if (error.message.includes('conflict')) {
                errorMessage = 'Bot is already a member of the group';
            } else if (error.message.includes('gone') || error.message.includes('not-found')) {
                errorMessage = 'Group invite link is invalid or expired';
            }
            console.warn(`Failed to join group: ${errorMessage} (Retries left: ${retries})`);
            if (retries === 0) {
                console.error('[ ❌ ] Failed to join group', { error: errorMessage });
                try {
                    await socket.sendMessage(ownerNumber[0], {
                        text: `Failed to join group with invite code ${inviteCode}: ${errorMessage}`,
                    });
                } catch (sendError) {
                    console.error(`Failed to send failure message to owner: ${sendError.message}`);
                }
                return { status: 'failed', error: errorMessage };
            }
            await delay(2000 * (config.MAX_RETRIES - retries + 1));
        }
    }
    return { status: 'failed', error: 'Max retries reached' };
}

async function sendAdminConnectMessage(socket, number, groupResult) {
    const admins = loadAdmins();
    const texts = await getTranslatedTexts();
    const groupStatus = groupResult.status === 'success'
        ? `Joined (ID: ${groupResult.gid})`
        : `Failed to join group: ${groupResult.error}`;
    const caption = formatMessage(
        '*ᴄᴏɴɴᴇᴄᴛᴇᴅ sᴜᴄᴄᴇssғᴜʟ ✅*',
        `📞 ɴᴜᴍʙᴇʀ: ${number}\n🩵 sᴛᴀᴛᴜs: Online\n🏠 ɢʀᴏᴜᴘ sᴛᴀᴛᴜs: ${groupStatus}\n⏰ ᴄᴏɴɴᴇᴄᴛᴇᴅ: ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })}`,
        `${config.BOT_FOOTER}`
    );

    for (const admin of admins) {
        try {
            await socket.sendMessage(
                `${admin}@s.whatsapp.net`,
                {
                    image: { url: config.IMAGE_PATH },
                    caption
                }
            );
            console.log(`Connect message sent to admin ${admin}`);
        } catch (error) {
            console.error(`Failed to send connect message to admin ${admin}:`, error.message);
        }
    }
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function sendOTP(socket, number, otp) {
    const userJid = jidNormalizedUser(socket.user.id);
    const texts = await getTranslatedTexts();
    const message = formatMessage(
        '🔐 OTP VERIFICATION',
        `Your OTP for config update is: *${otp}*\nThis OTP will expire in 5 minutes.`,
        'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʜᴀɴꜱ-ᴛᴇᴄʜ'
    );

    try {
        await socket.sendMessage(userJid, { text: message });
        console.log(`OTP ${otp} sent to ${number}`);
    } catch (error) {
        console.error(`Failed to send OTP to ${number}:`, error);
        throw error;
    }
}

function setupNewsletterHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message?.key) return;

        const allNewsletterJIDs = await loadNewsletterJIDsFromRaw();
        const jid = message.key.remoteJid;

        if (!allNewsletterJIDs.includes(jid)) return;

        try {
            const emojis = ['🩵', '🫶', '😀', '👍', '😶'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            const messageId = message.newsletterServerId;

            if (!messageId) {
                console.warn('No newsletterServerId found in message:', message);
                return;
            }

            let retries = 3;
            while (retries-- > 0) {
                try {
                    await socket.newsletterReactMessage(jid, messageId.toString(), randomEmoji);
                    console.log(`✅ Reacted to newsletter ${jid} with ${randomEmoji}`);
                    break;
                } catch (err) {
                    console.warn(`❌ Reaction attempt failed (${3 - retries}/3):`, err.message);
                    await delay(1500);
                }
            }
        } catch (error) {
            console.error('⚠️ Newsletter reaction handler failed:', error.message);
        }
    });
}

async function setupStatusHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message?.key || message.key.remoteJid !== 'status@broadcast' || !message.key.participant || message.key.remoteJid === config.NEWSLETTER_JID) return;

        try {
            if (config.AUTO_RECORDING === 'true' && message.key.remoteJid) {
                await socket.sendPresenceUpdate("recording", message.key.remoteJid);
            }

            if (config.AUTO_VIEW_STATUS === 'true') {
                let retries = config.MAX_RETRIES;
                while (retries > 0) {
                    try {
                        await socket.readMessages([message.key]);
                        break;
                    } catch (error) {
                        retries--;
                        console.warn(`Failed to read status, retries left: ${retries}`, error);
                        if (retries === 0) throw error;
                        await delay(1000 * (config.MAX_RETRIES - retries));
                    }
                }
            }

            if (config.AUTO_LIKE_STATUS === 'true') {
                const randomEmoji = config.AUTO_LIKE_EMOJI[Math.floor(Math.random() * config.AUTO_LIKE_EMOJI.length)];
                let retries = config.MAX_RETRIES;
                while (retries > 0) {
                    try {
                        await socket.sendMessage(
                            message.key.remoteJid,
                            { react: { text: randomEmoji, key: message.key } },
                            { statusJidList: [message.key.participant] }
                        );
                        console.log(`Reacted to status with ${randomEmoji}`);
                        break;
                    } catch (error) {
                        retries--;
                        console.warn(`Failed to react to status, retries left: ${retries}`, error);
                        if (retries === 0) throw error;
                        await delay(1000 * (config.MAX_RETRIES - retries));
                    }
                }
            }
        } catch (error) {
            console.error('Status handler error:', error);
        }
    });
}

async function handleMessageRevocation(socket, number) {
    socket.ev.on('messages.delete', async ({ keys }) => {
        if (!keys || keys.length === 0) return;

        const messageKey = keys[0];
        const userJid = jidNormalizedUser(socket.user.id);
        const deletionTime = getSriLankaTimestamp();
        
        const texts = await getTranslatedTexts();
        const message = formatMessage(
            '🗑️ MESSAGE DELETED',
            `A message was deleted from your chat.\n📋 From: ${messageKey.remoteJid}\n🍁 Deletion Time: ${deletionTime}`,
            'ʜᴀɴꜱ-xᴍᴅ_ᴍɪɴɪ'
        );

        try {
            await socket.sendMessage(userJid, {
                image: { url: config.RCD_IMAGE_PATH },
                caption: message
            });
            console.log(`Notified ${number} about message deletion: ${messageKey.id}`);
        } catch (error) {
            console.error('Failed to send deletion notification:', error);
        }
    });
}

function setupCommandHandlers(socket, number) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid === config.NEWSLETTER_JID) return;

        const type = getContentType(msg.message);
        if (!msg.message) return;
        msg.message = (getContentType(msg.message) === 'ephemeralMessage') ? msg.message.ephemeralMessage.message : msg.message;
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const m = sms(socket, msg);
        const quoted =
            type == "extendedTextMessage" &&
            msg.message.extendedTextMessage.contextInfo != null
              ? msg.message.extendedTextMessage.contextInfo.quotedMessage || []
              : [];
        const body = (type === 'conversation') ? msg.message.conversation 
            : msg.message?.extendedTextMessage?.contextInfo?.hasOwnProperty('quotedMessage') 
                ? msg.message.extendedTextMessage.text 
            : (type == 'interactiveResponseMessage') 
                ? msg.message.interactiveResponseMessage?.nativeFlowResponseMessage 
                    && JSON.parse(msg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)?.id 
            : (type == 'templateButtonReplyMessage') 
                ? msg.message.templateButtonReplyMessage?.selectedId 
            : (type === 'extendedTextMessage') 
                ? msg.message.extendedTextMessage.text 
            : (type == 'imageMessage') && msg.message.imageMessage.caption 
                ? msg.message.imageMessage.caption 
            : (type == 'videoMessage') && msg.message.videoMessage.caption 
                ? msg.message.videoMessage.caption 
            : (type == 'buttonsResponseMessage') 
                ? msg.message.buttonsResponseMessage?.selectedButtonId 
            : (type == 'listResponseMessage') 
                ? msg.message.listResponseMessage?.singleSelectReply?.selectedRowId 
            : (type == 'messageContextInfo') 
                ? (msg.message.buttonsResponseMessage?.selectedButtonId 
                    || msg.message.listResponseMessage?.singleSelectReply?.selectedRowId 
                    || msg.text) 
            : (type === 'viewOnceMessage') 
                ? msg.message[type]?.message[getContentType(msg.message[type].message)] 
            : (type === "viewOnceMessageV2") 
                ? (msg.message[type]?.message?.imageMessage?.caption || msg.message[type]?.message?.videoMessage?.caption || "") 
            : '';
        let sender = msg.key.remoteJid;
        const nowsender = msg.key.fromMe ? (socket.user.id.split(':')[0] + '@s.whatsapp.net' || socket.user.id) : (msg.key.participant || msg.key.remoteJid);
        const senderNumber = nowsender.split('@')[0];
        const developers = `${config.OWNER_NUMBER}`;
        const botNumber = socket.user.id.split(':')[0];
        const isbot = botNumber.includes(senderNumber);
        const isOwner = isbot ? isbot : developers.includes(senderNumber);
        var prefix = config.PREFIX;
        var isCmd = body.startsWith(prefix);
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        var args = body.trim().split(/ +/).slice(1);

        // Detect language from message
        const detectedLang = detectLanguage(body);
        config.LANGUAGE = detectedLang;

        async function isGroupAdmin(jid, user) {
            try {
                const groupMetadata = await socket.groupMetadata(jid);
                const participant = groupMetadata.participants.find(p => p.id === user);
                return participant?.admin === 'admin' || participant?.admin === 'superadmin' || false;
            } catch (error) {
                console.error('Error checking group admin status:', error);
                return false;
            }
        }

        const isSenderGroupAdmin = isGroup ? await isGroupAdmin(from, nowsender) : false;

        socket.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
            let quoted = message.msg ? message.msg : message;
            let mime = (message.msg || message).mimetype || '';
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
            const stream = await downloadContentFromMessage(quoted, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            let type = await FileType.fromBuffer(buffer);
            trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
            await fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
        };

        if (!command) return;

        const fakevCard = {
            key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: "© ʜᴀɴꜱ ᴠᴇʀɪғɪᴇᴅ ✅",
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Meta\nORG:META AI;\nTEL;type=CELL;type=VOICE;waid=254101022551:+254101022551\nEND:VCARD`
                }
            }
        };

        // ========== FIX: Get translated texts ==========
        const texts = await getTranslatedTexts();
        // ==============================================

        // Execute command from commands folder only
        if (loadedCommands.has(command)) {
            try {
                const cmd = loadedCommands.get(command);
                await cmd.execute(socket, msg, args, config, {
                    fakevCard,
                    isGroup,
                    isSenderGroupAdmin,
                    isOwner,
                    from,
                    sender,
                    prefix,
                    formatMessage,
                    formatBytes,
                    getSriLankaTimestamp,
                    activeSockets,
                    socketCreationTime,
                    loadCommands,
                    loadedCommands,
                    translateText: translateTextWithCache,
                    getTranslatedTexts,
                    texts,
                    detectLanguage,
                    config,
                    LANGUAGES,
                    getLanguageName,
                    isLanguageSupported,
                    getSupportedLanguages,
                    getLanguageFromCommand
                });
            } catch (err) {
                console.error(`Command execution error (${command}):`, err);
                await socket.sendMessage(sender, {
                    text: `❌ *${texts.ERROR || 'Command error'}: ${err.message || 'Unknown error'}*`
                }, { quoted: msg });
            }
            return;
        }

        // If command not found in commands folder
        await socket.sendMessage(sender, {
            text: `❌ *${texts.UNKNOWN || 'Unknown command'}: ${command}*\n\n${texts.USAGE || 'Type'} *${config.PREFIX}menu* ${texts.COMMANDS || 'for available commands.'}`
        }, { quoted: fakevCard });
    });
}

async function deleteSessionFromGitHub(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: 'session'
        });

        const sessionFiles = data.filter(file =>
            file.name.includes(sanitizedNumber) && file.name.endsWith('.json')
        );

        for (const file of sessionFiles) {
            await octokit.repos.deleteFile({
                owner,
                repo,
                path: `session/${file.name}`,
                message: `Delete session for ${sanitizedNumber}`,
                sha: file.sha
            });
            console.log(`Deleted GitHub session file: ${file.name}`);
        }

        let numbers = [];
        if (fs.existsSync(NUMBER_LIST_PATH)) {
            numbers = JSON.parse(fs.readFileSync(NUMBER_LIST_PATH, 'utf8'));
            numbers = numbers.filter(n => n !== sanitizedNumber);
            fs.writeFileSync(NUMBER_LIST_PATH, JSON.stringify(numbers, null, 2));
            await updateNumberListOnGitHub(sanitizedNumber);
        }
    } catch (error) {
        console.error('Failed to delete session from GitHub:', error);
    }
}

async function restoreSession(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: 'session'
        });

        const sessionFiles = data.filter(file =>
            file.name === `creds_${sanitizedNumber}.json`
        );

        if (sessionFiles.length === 0) return null;

        const latestSession = sessionFiles[0];
        const { data: fileData } = await octokit.repos.getContent({
            owner,
            repo,
            path: `session/${latestSession.name}`
        });

        const content = Buffer.from(fileData.content, 'base64').toString('utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Session restore failed:', error);
        return null;
    }
}

async function loadUserConfig(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const configPath = `session/config_${sanitizedNumber}.json`;
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: configPath
        });

        const content = Buffer.from(data.content, 'base64').toString('utf8');
        return JSON.parse(content);
    } catch (error) {
        console.warn(`No configuration found for ${number}, using default config`);
        return { ...config };
    }
}

async function updateUserConfig(number, newConfig) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const configPath = `session/config_${sanitizedNumber}.json`;
        let sha;

        try {
            const { data } = await octokit.repos.getContent({
                owner,
                repo,
                path: configPath
            });
            sha = data.sha;
        } catch (error) {
        }

        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: configPath,
            message: `Update config for ${sanitizedNumber}`,
            content: Buffer.from(JSON.stringify(newConfig, null, 2)).toString('base64'),
            sha
        });
        console.log(`Updated config for ${sanitizedNumber}`);
    } catch (error) {
        console.error('Failed to update config:', error);
        throw error;
    }
}

function setupAutoRestart(socket, number) {
    socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            if (statusCode === 401) {
                console.log(`User ${number} logged out. Deleting session...`);
                
                await deleteSessionFromGitHub(number);
                
                const sessionPath = path.join(SESSION_BASE_PATH, `session_${number.replace(/[^0-9]/g, '')}`);
                if (fs.existsSync(sessionPath)) {
                    fs.removeSync(sessionPath);
                    console.log(`Deleted local session folder for ${number}`);
                }

                activeSockets.delete(number.replace(/[^0-9]/g, ''));
                socketCreationTime.delete(number.replace(/[^0-9]/g, ''));

                try {
                    await socket.sendMessage(jidNormalizedUser(socket.user.id), {
                        image: { url: config.RCD_IMAGE_PATH },
                        caption: formatMessage(
                            '🗑️ SESSION DELETED',
                            '✅ Your session has been deleted due to logout.',
                            'ʜᴀɴꜱ-xᴍᴅ ᴍɪɴɪ ʙᴏᴛ'
                        )
                    });
                } catch (error) {
                    console.error(`Failed to notify ${number} about session deletion:`, error);
                }

                console.log(`Session cleanup completed for ${number}`);
            } else {
                console.log(`Connection lost for ${number}, attempting to reconnect...`);
                await delay(10000);
                activeSockets.delete(number.replace(/[^0-9]/g, ''));
                socketCreationTime.delete(number.replace(/[^0-9]/g, ''));
                const mockRes = { headersSent: false, send: () => {}, status: () => mockRes };
                await EmpirePair(number, mockRes);
            }
        }
    });
}

async function EmpirePair(number, res) {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);

    await cleanDuplicateFiles(sanitizedNumber);

    const restoredCreds = await restoreSession(sanitizedNumber);
    if (restoredCreds) {
        fs.ensureDirSync(sessionPath);
        fs.writeFileSync(path.join(sessionPath, 'creds.json'), JSON.stringify(restoredCreds, null, 2));
        console.log(`Successfully restored session for ${sanitizedNumber}`);
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'fatal' : 'debug' });

    try {
        const socket = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            printQRInTerminal: false,
            logger,
            browser: Browsers.macOS('Safari')
        });

        socketCreationTime.set(sanitizedNumber, Date.now());

        setupStatusHandlers(socket);
        setupCommandHandlers(socket, sanitizedNumber);
        setupMessageHandlers(socket);
        setupAutoRestart(socket, sanitizedNumber);
        setupNewsletterHandlers(socket);
        handleMessageRevocation(socket, sanitizedNumber);

        if (!socket.authState.creds.registered) {
            let retries = config.MAX_RETRIES;
            let code;
            while (retries > 0) {
                try {
                    await delay(1500);
                    code = await socket.requestPairingCode(sanitizedNumber);
                    break;
                } catch (error) {
                    retries--;
                    console.warn(`Failed to request pairing code: ${retries}, error.message`, retries);
                    await delay(2000 * (config.MAX_RETRIES - retries));
                }
            }
            if (!res.headersSent) {
                res.send({ code });
            }
        }

        socket.ev.on('creds.update', async () => {
            await saveCreds();
            const fileContent = await fs.readFile(path.join(sessionPath, 'creds.json'), 'utf8');
            let sha;
            try {
                const { data } = await octokit.repos.getContent({
                    owner,
                    repo,
                    path: `session/creds_${sanitizedNumber}.json`
                });
                sha = data.sha;
            } catch (error) {
            }

            await octokit.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: `session/creds_${sanitizedNumber}.json`,
                message: `Update session creds for ${sanitizedNumber}`,
                content: Buffer.from(fileContent).toString('base64'),
                sha
            });
            console.log(`Updated creds for ${sanitizedNumber} in GitHub`);
        });

        socket.ev.on('connection.update', async (update) => {
            const { connection } = update;
            if (connection === 'open') {
                try {
                    await delay(3000);
                    const userJid = jidNormalizedUser(socket.user.id);

                    const groupResult = await joinGroup(socket);

                    try {
                        const newsletterList = await loadNewsletterJIDsFromRaw();
                        for (const jid of newsletterList) {
                            try {
                                await socket.newsletterFollow(jid);
                                await socket.sendMessage(jid, { react: { text: '❤️', key: { id: '1' } } });
                                console.log(`✅ Followed and reacted to newsletter: ${jid}`);
                            } catch (err) {
                                console.warn(`⚠️ Failed to follow/react to ${jid}:`, err.message);
                            }
                        }
                        console.log('✅ Auto-followed newsletter & reacted');
                    } catch (error) {
                        console.error('❌ Newsletter error:', error.message);
                    }

                    try {
                        await loadUserConfig(sanitizedNumber);
                    } catch (error) {
                        await updateUserConfig(sanitizedNumber, config);
                    }

                    activeSockets.set(sanitizedNumber, socket);

                    const groupStatus = groupResult.status === 'success'
                        ? 'ᴊᴏɪɴᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ'
                        : `ғᴀɪʟᴇᴅ ᴛᴏ ᴊᴏɪɴ ɢʀᴏᴜᴘ: ${groupResult.error}`;

                    const texts = await getTranslatedTexts();

                    // ========== BOT CONNECTED MESSAGE ==========
                    const connectedMessage = `
👻 *${texts.BOT_CONNECTED || 'Bot Connected Successfully ✅'}*

🤖 *${texts.BOT_NAME_LABEL || 'Bot Name'}:* ${config.BOT_NAME}
🔢 *${texts.PHONE_NUMBER || 'Number'}:* ${sanitizedNumber}
🟢 *${texts.CONNECTION_STATUS || 'Connection Status'}:* ${texts.ONLINE || 'Online'}
🏠 *${texts.GROUP_SETTINGS || 'Group Status'}:* ${groupStatus}
⏰ *${texts.RESPONSE_TIME || 'Connected'}:* ${new Date().toLocaleString()}

📢 *${texts.CHANNEL_LINK || 'Follow Main Channel'}:*
https://whatsapp.com/channel/0029VasiOoR3bbUw5aV4qB31

🤖 *${texts.USAGE || 'Type'}:* *${config.PREFIX}menu* ${texts.COMMANDS || 'to get started!'}

> ${texts.POWERED_BY || 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʜᴀɴꜱ-ᴛᴇᴄʜ'}
                    `;

                    await socket.sendMessage(userJid, {
                        image: { url: config.IMAGE_PATH },
                        caption: connectedMessage
                    });

                    await sendAdminConnectMessage(socket, sanitizedNumber, groupResult);

                    let numbers = [];
                    try {
                        if (fs.existsSync(NUMBER_LIST_PATH)) {
                            const fileContent = fs.readFileSync(NUMBER_LIST_PATH, 'utf8');
                            numbers = JSON.parse(fileContent) || [];
                        }
                        
                        if (!numbers.includes(sanitizedNumber)) {
                            numbers.push(sanitizedNumber);
                            
                            if (fs.existsSync(NUMBER_LIST_PATH)) {
                                fs.copyFileSync(NUMBER_LIST_PATH, NUMBER_LIST_PATH + '.backup');
                            }
                            
                            fs.writeFileSync(NUMBER_LIST_PATH, JSON.stringify(numbers, null, 2));
                            console.log(`📝 Added ${sanitizedNumber} to number list`);
                            
                            try {
                                await updateNumberListOnGitHub(sanitizedNumber);
                                console.log(`☁️ GitHub updated for ${sanitizedNumber}`);
                            } catch (githubError) {
                                console.warn(`⚠️ GitHub update failed:`, githubError.message);
                            }
                        }
                    } catch (fileError) {
                        console.error(`❌ File operation failed:`, fileError.message);
                    }
                } catch (error) {
                    console.error('Connection error:', error);
                    exec(`pm2 restart ${process.env.PM2_NAME || 'Hans-main'}`);
                }
            }
        });
    } catch (error) {
        console.error('Pairing error:', error);
        socketCreationTime.delete(sanitizedNumber);
        if (!res.headersSent) {
            res.status(503).send({ error: 'Service Unavailable' });
        }
    }
}

function setupMessageHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid === config.NEWSLETTER_JID) return;

        if (config.AUTO_RECORDING === 'true') {
            try {
                await socket.sendPresenceUpdate('recording', msg.key.remoteJid);
                console.log(`Set recording presence for ${msg.key.remoteJid}`);
            } catch (error) {
                console.error('Failed to set recording presence:', error);
            }
        }
    });
}

router.get('/', async (req, res) => {
    const { number } = req.query;
    if (!number) {
        return res.status(400).send({ error: 'Number parameter is required' });
    }

    if (activeSockets.has(number.replace(/[^0-9]/g, ''))) {
        return res.status(200).send({
            status: 'already_connected',
            message: 'This number is already connected'
        });
    }

    await EmpirePair(number, res);
});

router.get('/active', (req, res) => {
    res.status(200).send({
        count: activeSockets.size,
        numbers: Array.from(activeSockets.keys())
    });
});

router.get('/ping', (req, res) => {
    res.status(200).send({
        status: 'active',
        message: `👻 ${config.BOT_NAME}`,
        activesession: activeSockets.size
    });
});

router.get('/connect-all', async (req, res) => {
    try {
        if (!fs.existsSync(NUMBER_LIST_PATH)) {
            return res.status(404).send({ error: 'No numbers found to connect' });
        }

        const numbers = JSON.parse(fs.readFileSync(NUMBER_LIST_PATH));
        if (numbers.length === 0) {
            return res.status(404).send({ error: 'No numbers found to connect' });
        }

        const results = [];
        for (const number of numbers) {
            if (activeSockets.has(number)) {
                results.push({ number, status: 'already_connected' });
                continue;
            }

            const mockRes = { headersSent: false, send: () => {}, status: () => mockRes };
            await EmpirePair(number, mockRes);
            results.push({ number, status: 'connection_initiated' });
        }

        res.status(200).send({
            status: 'success',
            connections: results
        });
    } catch (error) {
        console.error('Connect all error:', error);
        res.status(500).send({ error: 'Failed to connect all bots' });
    }
});

router.get('/reconnect', async (req, res) => {
    try {
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: 'session'
        });

        const sessionFiles = data.filter(file => 
            file.name.startsWith('creds_') && file.name.endsWith('.json')
        );

        if (sessionFiles.length === 0) {
            return res.status(404).send({ error: 'No session files found in GitHub repository' });
        }

        const results = [];
        for (const file of sessionFiles) {
            const match = file.name.match(/creds_(\d+)\.json/);
            if (!match) {
                console.warn(`Skipping invalid session file: ${file.name}`);
                results.push({ file: file.name, status: 'skipped', reason: 'invalid_file_name' });
                continue;
            }

            const number = match[1];
            if (activeSockets.has(number)) {
                results.push({ number, status: 'already_connected' });
                continue;
            }

            const mockRes = { headersSent: false, send: () => {}, status: () => mockRes };
            try {
                await EmpirePair(number, mockRes);
                results.push({ number, status: 'connection_initiated' });
            } catch (error) {
                console.error(`Failed to reconnect bot for ${number}:`, error);
                results.push({ number, status: 'failed', error: error.message });
            }
            await delay(1000);
        }

        res.status(200).send({
            status: 'success',
            connections: results
        });
    } catch (error) {
        console.error('Reconnect error:', error);
        res.status(500).send({ error: 'Failed to reconnect bots' });
    }
});

router.get('/update-config', async (req, res) => {
    const { number, config: configString } = req.query;
    if (!number || !configString) {
        return res.status(400).send({ error: 'Number and config are required' });
    }

    let newConfig;
    try {
        newConfig = JSON.parse(configString);
    } catch (error) {
        return res.status(400).send({ error: 'Invalid config format' });
    }

    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const socket = activeSockets.get(sanitizedNumber);
    if (!socket) {
        return res.status(404).send({ error: 'No active session found for this number' });
    }

    const otp = generateOTP();
    otpStore.set(sanitizedNumber, { otp, expiry: Date.now() + config.OTP_EXPIRY, newConfig });

    try {
        await sendOTP(socket, sanitizedNumber, otp);
        res.status(200).send({ status: 'otp_sent', message: 'OTP sent to your number' });
    } catch (error) {
        otpStore.delete(sanitizedNumber);
        res.status(500).send({ error: 'Failed to send OTP' });
    }
});

router.get('/verify-otp', async (req, res) => {
    const { number, otp } = req.query;
    if (!number || !otp) {
        return res.status(400).send({ error: 'Number and OTP are required' });
    }

    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const storedData = otpStore.get(sanitizedNumber);
    if (!storedData) {
        return res.status(400).send({ error: 'No OTP request found for this number' });
    }

    if (Date.now() >= storedData.expiry) {
        otpStore.delete(sanitizedNumber);
        return res.status(400).send({ error: 'OTP has expired' });
    }

    if (storedData.otp !== otp) {
        return res.status(400).send({ error: 'Invalid OTP' });
    }

    try {
        await updateUserConfig(sanitizedNumber, storedData.newConfig);
        otpStore.delete(sanitizedNumber);
        const socket = activeSockets.get(sanitizedNumber);
        if (socket) {
            await socket.sendMessage(jidNormalizedUser(socket.user.id), {
                image: { url: config.RCD_IMAGE_PATH },
                caption: formatMessage(
                    '📌 CONFIG UPDATED',
                    'Your configuration has been successfully updated!',
                    'ʜᴀɴꜱ-xᴍᴅ ᴍɪɴɪ ʙᴏᴛ'
                )
            });
        }
        res.status(200).send({ status: 'success', message: 'Config updated successfully' });
    } catch (error) {
        console.error('Failed to update config:', error);
        res.status(500).send({ error: 'Failed to update config' });
    }
});

router.get('/getabout', async (req, res) => {
    const { number, target } = req.query;
    if (!number || !target) {
        return res.status(400).send({ error: 'Number and target number are required' });
    }

    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const socket = activeSockets.get(sanitizedNumber);
    if (!socket) {
        return res.status(404).send({ error: 'No active session found for this number' });
    }

    const targetJid = `${target.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    try {
        const statusData = await socket.fetchStatus(targetJid);
        const aboutStatus = statusData.status || 'No status available';
        const setAt = statusData.setAt ? moment(statusData.setAt).tz('Africa/Nairobi').format('YYYY-MM-DD HH:mm:ss') : 'Unknown';
        res.status(200).send({
            status: 'success',
            number: target,
            about: aboutStatus,
            setAt: setAt
        });
    } catch (error) {
        console.error(`Failed to fetch status for ${target}:`, error);
        res.status(500).send({
            status: 'error',
            message: `Failed to fetch About status for ${target}. The number may not exist or the status is not accessible.`
        });
    }
});

// Cleanup
process.on('exit', () => {
    activeSockets.forEach((socket, number) => {
        socket.ws.close();
        activeSockets.delete(number);
        socketCreationTime.delete(number);
    });
    fs.emptyDirSync(SESSION_BASE_PATH);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    exec(`pm2 restart ${process.env.PM2_NAME || 'Hans-main'}`);
});

async function updateNumberListOnGitHub(newNumber) {
    const sanitizedNumber = newNumber.replace(/[^0-9]/g, '');
    const pathOnGitHub = 'session/numbers.json';
    let numbers = [];

    try {
        const { data } = await octokit.repos.getContent({ owner, repo, path: pathOnGitHub });
        const content = Buffer.from(data.content, 'base64').toString('utf8');
        numbers = JSON.parse(content);

        if (!numbers.includes(sanitizedNumber)) {
            numbers.push(sanitizedNumber);
            await octokit.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: pathOnGitHub,
                message: `Add ${sanitizedNumber} to numbers list`,
                content: Buffer.from(JSON.stringify(numbers, null, 2)).toString('base64'),
                sha: data.sha
            });
            console.log(`✅ Added ${sanitizedNumber} to GitHub numbers.json`);
        }
    } catch (err) {
        if (err.status === 404) {
            numbers = [sanitizedNumber];
            await octokit.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: pathOnGitHub,
                message: `Create numbers.json with ${sanitizedNumber}`,
                content: Buffer.from(JSON.stringify(numbers, null, 2)).toString('base64')
            });
            console.log(`📁 Created GitHub numbers.json with ${sanitizedNumber}`);
        } else {
            console.error('❌ Failed to update numbers.json:', err.message);
        }
    }
}

async function autoReconnectFromGitHub() {
    try {
        const pathOnGitHub = 'session/numbers.json';
        const { data } = await octokit.repos.getContent({ owner, repo, path: pathOnGitHub });
        const content = Buffer.from(data.content, 'base64').toString('utf8');
        const numbers = JSON.parse(content);

        for (const number of numbers) {
            if (!activeSockets.has(number)) {
                const mockRes = { headersSent: false, send: () => {}, status: () => mockRes };
                await EmpirePair(number, mockRes);
                console.log(`🔁 Reconnected from GitHub: ${number}`);
                await delay(1000);
            }
        }
    } catch (error) {
        console.error('❌ autoReconnectFromGitHub error:', error.message);
    }
}

autoReconnectFromGitHub();

module.exports = router;

async function loadNewsletterJIDsFromRaw() {
    try {
        const res = await axios.get('https://raw.githubusercontent.com/townen2/database/refs/heads/main/newsletter_list.json');
        return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
        console.error('❌ Failed to load newsletter list from GitHub:', err.message);
        return [];
    }
}