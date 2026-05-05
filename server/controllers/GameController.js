const Game = require('../models/Game');

class GameController {
    constructor(io) {
        this.io = io;
        this.games = {}; // Хранилище активных комнат
    }

    init() {
        this.io.on('connection', (socket) => {
            console.log(`Игрок подключился: ${socket.id}`);

            socket.on('createGame', () => {
                const gameId = `room_${Math.floor(Math.random() * 10000)}`;
                this.games[gameId] = new Game(gameId);
                this.games[gameId].addPlayer(socket.id);
                socket.join(gameId);
                socket.emit('gameCreated', { gameId });
            });

            socket.on('shoot', ({ gameId, x, y }) => {
                const game = this.games[gameId];
                if (game) {
                    const result = game.handleShot(socket.id, x, y);
                    this.io.to(gameId).emit('shotResult', result);
                }
            });

            socket.on('disconnect', () => {
                console.log(`Игрок отключился: ${socket.id}`);
            });
        });
    }
}

module.exports = GameController;