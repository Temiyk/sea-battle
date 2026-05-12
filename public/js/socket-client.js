const socket = io();

const GameStats = {
    startTime: null,
    myShots: 0,
    myHits: 0,
    mySunkenShips: 0,
    opponentShots: 0,
    opponentHits: 0,
    opponentSunkenShips: 0,

    reset() {
        this.startTime = Date.now();
        this.myShots = 0;
        this.myHits = 0;
        this.mySunkenShips = 0;
        this.opponentShots = 0;
        this.opponentHits = 0;
        this.opponentSunkenShips = 0;
    },

    getDuration() {
        if (!this.startTime) return '—';
        const ms = Date.now() - this.startTime;
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
};

const Network = {
    gameId: null,
    isMyTurn: false,
    myShips: [],
    isRematch: false,

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
    document.getElementById('lobby-controls').classList.add('hidden');
    document.getElementById('btn-back-to-placement').classList.add('hidden');
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
    if (data.gameId) Network.gameId = data.gameId;
    Network.isRematch = false;
    document.getElementById('btn-back-to-placement').classList.add('hidden');

    GameStats.reset();

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

    if (isMyShot) {
        GameStats.myShots++;
        if (result === 'hit') GameStats.myHits++;
        if (sunkenShipCoords) GameStats.mySunkenShips++;
    } else {
        GameStats.opponentShots++;
        if (result === 'hit') GameStats.opponentHits++;
        if (sunkenShipCoords) GameStats.opponentSunkenShips++;
    }

    UI.updateCell(targetBoard, x, y, result === 'hit' ? 'hit' : 'miss');

    if (sunkenShipCoords) {
        surroundings.forEach(cell => {
            UI.updateCell(targetBoard, cell.x, cell.y, 'miss');
        });
        UI.markShipSunk(targetFleet, sunkenShipCoords.length);

        if (isMyShot) UI.setStatus('Вы потопили корабль!');
    }
});

socket.on('rematchRequested', () => {
    UI.setStatus('Противник предлагает реванш!');
});

socket.on('rematchAccepted', () => {
    Network.isRematch = true;
    UI.hideGameOver();
    window.Placement.reset();
    UI.showPlacement();
    UI.setLobbyStatus('');
});

socket.on('gameEnd', (data) => {
    const isWinner = data.winner === socket.id;
    const stats = {
        duration: GameStats.getDuration(),
        myShots: GameStats.myShots,
        myHits: GameStats.myHits,
        myAccuracy: GameStats.myShots > 0
            ? Math.round((GameStats.myHits / GameStats.myShots) * 100)
            : 0,
        mySunkenShips: GameStats.mySunkenShips,
        opponentShots: GameStats.opponentShots,
        opponentHits: GameStats.opponentHits,
        opponentAccuracy: GameStats.opponentShots > 0
            ? Math.round((GameStats.opponentHits / GameStats.opponentShots) * 100)
            : 0,
        opponentSunkenShips: GameStats.opponentSunkenShips,
    };
    UI.showGameOver(isWinner ? '🏆 Победа!' : '💀 Поражение.', stats);
});

socket.on('error', (msg) => {
    UI.setLobbyStatus(msg);
    alert(msg);
});