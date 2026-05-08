const socket = io();

const Network = {
    gameId: null,
    isMyTurn: false,

    createGame() {
        socket.emit('createGame');
    },

    joinGame(roomId) {
        socket.emit('joinGame', roomId);
    },

    shoot(x, y) {
        if (!this.gameId || !this.isMyTurn) return;
        socket.emit('shoot', { gameId: this.gameId, x, y });
    },

    requestRematch() {
        socket.emit('requestRematch', this.gameId);
    },

    leaveRoom() {
        socket.emit('leaveRoom', this.gameId);
    }
};

socket.on('connect', () => {
    console.log('Подключено к серверу! ID:', socket.id);
});

socket.on('gameCreated', (data) => {
    Network.gameId = data.gameId;
    UI.setStatus('Ожидание второго игрока... ID: ' + data.gameId);
    UI.showGameArea();
    UI.renderBoard('my-board');
    UI.renderBoard('enemy-board');
});

socket.on('gameStarted', (data) => {
    if(data.gameId) Network.gameId = data.gameId;
    UI.hideGameOver();

    UI.renderBoard('my-board');
    UI.renderBoard('enemy-board');

    UI.showShips('my-board', data.myBoard.ships);

    Network.isMyTurn = data.turn === socket.id;
    UI.setTurn(Network.isMyTurn);
});

socket.on('turnChanged', (data) => {
    Network.isMyTurn = data.turn === socket.id;
    UI.setTurn(Network.isMyTurn);
});

socket.on('shotResult', (data) => {
    const { x, y, result, shooter, sunkenShipCoords, surroundings } = data;
    const isMyShot = shooter === socket.id;
    const targetBoard = isMyShot ? 'enemy-board' : 'my-board';

    UI.updateCell(targetBoard, x, y, result === 'hit' ? 'hit' : 'miss');

    if (sunkenShipCoords) {
        surroundings.forEach(cell => {
            UI.updateCell(targetBoard, cell.x, cell.y, 'miss');
        });
        if(isMyShot) UI.setStatus('Вы потопили корабль!');
    }
});

socket.on('rematchRequested', () => {
    UI.setStatus('Противник предлагает реванш!');
});

socket.on('gameEnd', (data) => {
    const isWinner = data.winner === socket.id;
    UI.showGameOver(isWinner ? 'Вы победили!' : 'Вы проиграли.');
});

socket.on('error', (msg) => {
    alert(msg);
});