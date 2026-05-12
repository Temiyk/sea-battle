const Game = require('../models/Game');

class GameController {
    constructor(io) {
        this.io = io;
        this.games = {};
    }

    init() {
        this.io.on('connection', (socket) => {

            socket.on('createGame', (ships) => {
                const gameId = 'room_' + Math.floor(Math.random() * 10000);
                const game = new Game(gameId);
                game.addPlayer(socket.id, ships);
                this.games[gameId] = game;
                socket.join(gameId);
                socket.emit('gameCreated', { gameId });
            });

            socket.on('joinGame', ({ gameId, ships }) => {
                const game = this.games[gameId];
                if (!game) {
                    socket.emit('error', 'Комната не найдена');
                    return;
                }
                if (game.players.length >= 2 && !game.players.includes(socket.id)) {
                    socket.emit('error', 'Комната заполнена');
                    return;
                }

                game.addPlayer(socket.id, ships);
                socket.join(gameId);
                game.start();

                game.players.forEach((playerId) => {
                    const playerSocket = this.io.sockets.sockets.get(playerId);
                    if (playerSocket) {
                        playerSocket.emit('gameStarted', {
                            gameId: game.gameId,
                            myBoard: game.getBoardForPlayer(playerId),
                            turn: game.turn
                        });
                    }
                });
            });

            socket.on('shoot', ({ gameId, x, y }) => {
                const game = this.games[gameId];
                if (!game) return;
                const result = game.handleShot(socket.id, +x, +y);

                if (result.error) {
                    if(result.error !== 'Клетка закрашена!') {
                        socket.emit('error', result.error);
                    }
                    return;
                }
                this.io.to(gameId).emit('shotResult', {
                    x: result.x,
                    y: result.y,
                    result: result.result,
                    shooter: socket.id,
                    sunkenShipCoords: result.sunkenShipCoords,
                    surroundings: result.surroundings
                });

                if (game.isGameOver()) {
                    const duration = Math.floor((Date.now() - game.startTime) / 1000);
                    this.io.to(gameId).emit('gameEnd', {
                        winner: socket.id,
                        stats: game.stats,
                        duration: duration
                    });
                } else {
                    this.io.to(gameId).emit('turnChanged', { turn: game.turn });
                }
            });

            socket.on('requestRematch', (gameId) => {
                const game = this.games[gameId];
                if (!game) return;

                if (!game.rematchRequests) game.rematchRequests = new Set();
                game.rematchRequests.add(socket.id);

                if (game.rematchRequests.size === 2) {
                    game.rematchRequests.clear();
                    game.started = false;
                    game.boards = {};
                    this.io.to(gameId).emit('rematchAccepted');
                } else {
                    socket.to(gameId).emit('rematchRequested');
                }
            });

            socket.on('submitNewShips', ({ gameId, ships }) => {
                const game = this.games[gameId];
                if (!game) return;
                game.addPlayer(socket.id, ships);

                if (Object.keys(game.boards).length === 2) {
                    game.start();
                    game.players.forEach((playerId) => {
                        const playerSocket = this.io.sockets.sockets.get(playerId);
                        if (playerSocket) {
                            playerSocket.emit('gameStarted', {
                                gameId: game.gameId,
                                myBoard: game.getBoardForPlayer(playerId),
                                turn: game.turn
                            });
                        }
                    });
                }
            });

            socket.on('leaveRoom', (gameId) => {
                if(this.games[gameId]) {
                    socket.to(gameId).emit('error', 'Противник покинул комнату.');
                    delete this.games[gameId];
                }
                socket.leave(gameId);
            });

            socket.on('disconnect', () => {
                for (const id in this.games) {
                    const game = this.games[id];
                    if (game.players.includes(socket.id)) {
                        this.io.to(id).emit('error', 'Противник отключился.');
                        delete this.games[id];
                    }
                }
            });
        });
    }
}

module.exports = GameController;