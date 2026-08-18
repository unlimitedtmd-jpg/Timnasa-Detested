const express = require('express');
const app = express();
__path = process.cwd()
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;
let code = require('./pair'); 

// Increase event listeners limit
require('events').EventEmitter.defaultMaxListeners = 500;

// Routes
app.use('/code', code);
app.use('/pair', async (req, res, next) => {
    res.sendFile(__path + '/pair.html')
});
app.use('/', async (req, res, next) => {
    res.sendFile(__path + '/main.html')
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint for keep-alive
app.get('/ping', (req, res) => {
    res.status(200).send({
        status: 'active',
        bot: 'njabulomini-bot',
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║     🤖 njabulomini-bot is alive!      ║
║                                        ║
║     📡 Server running on port: ${PORT}    ║
║     🌐 URL: http://localhost:${PORT}    ║
║     👑 Made by Hans Tech              ║
╚════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
