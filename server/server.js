const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const GameController = require('./controllers/GameController');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const gameController = new GameController(io);
gameController.init();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});