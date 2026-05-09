const socket = io();

const Network = {
    gameId: null,
    isMyTurn: false,
    myShips: [],

    createGame() {
        socket.emit('createGame', this.myShips);
    },

    joinGame(roomId) {
        socket.emit('joinGame', { gameId: roomId, ships: this.myShips });
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

socket.on('gameCreated', (data) => {
    Network.gameId = data.gameId;
    UI.showGameArea();
    UI.setTurn(false);
    UI.setStatus(`Ожидание противника... ID комнаты: ${data.gameId}`);
    UI.renderBoard('my-board');
    UI.renderBoard('enemy-board');
    UI.showShips('my-board', Network.myShips);
    UI.initFleet('my-fleet');
    UI.initFleet('enemy-fleet');
});

socket.on('gameStarted', (data) => {
    if(data.gameId) Network.gameId = data.gameId;
    UI.hideGameOver();
    UI.showGameArea();

    UI.renderBoard('my-board');
    UI.renderBoard('enemy-board');
    UI.showShips('my-board', data.myBoard.ships);
    UI.initFleet('my-fleet');
    UI.initFleet('enemy-fleet');

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
    const targetFleet = isMyShot ? 'enemy-fleet' : 'my-fleet';

    UI.updateCell(targetBoard, x, y, result === 'hit' ? 'hit' : 'miss');

    if (sunkenShipCoords) {
        surroundings.forEach(cell => {
            UI.updateCell(targetBoard, cell.x, cell.y, 'miss');
        });
        UI.markShipSunk(targetFleet, sunkenShipCoords.length);

        if(isMyShot) UI.setStatus('Вы потопили корабль!');
    }
});

socket.on('rematchRequested', () => {
    UI.setStatus('Противник предлагает реванш!');
});

socket.on('gameEnd', (data) => {
    const isWinner = data.winner === socket.id;
    UI.showGameOver(isWinner ? 'Победа!' : 'Поражение.');
});

socket.on('error', (msg) => {
    UI.setLobbyStatus(msg);
    alert(msg);
});