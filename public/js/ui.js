const UI = {
    renderBoard(boardElementId) {
        const board = document.getElementById(boardElementId);
        board.innerHTML = '';
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = x;
                cell.dataset.y = y;
                board.appendChild(cell);
            }
        }
    },

    showShips(boardId, shipCoordinates) {
        const board = document.getElementById(boardId);
        shipCoordinates.forEach(coords => {
            coords.forEach(([x, y]) => {
                const cell = board.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
                if (cell) cell.classList.add('ship');
            });
        });
    },

    updateCell(boardId, x, y, className) {
        const board = document.getElementById(boardId);
        const cell = board.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        if (cell) cell.classList.add(className);
    },

    setStatus(text) {
        const status = document.getElementById('status');
        if (status) status.textContent = text;
    },

    setLobbyStatus(text) {
        const status = document.getElementById('lobby-status');
        if (status) status.textContent = text;
    },

    showPlacement() {
        document.getElementById('lobby').style.display = 'none';
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('placement-area').style.display = 'block';
    },

    showLobby() {
        document.getElementById('placement-area').style.display = 'none';
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('lobby').style.display = 'flex';
    },

    showGameArea() {
        document.getElementById('lobby').style.display = 'none';
        document.getElementById('placement-area').style.display = 'none';
        document.getElementById('game-area').style.display = 'block';
    },

    setTurn(isMyTurn) {
        const indicator = document.getElementById('turn-indicator');
        const enemyBoard = document.getElementById('enemy-board');

        if (isMyTurn) {
            indicator.innerHTML = '&#8594;';
            enemyBoard.classList.remove('disabled');
            this.setStatus('Ваш ход!');
        } else {
            indicator.innerHTML = '&#8592;';
            enemyBoard.classList.add('disabled');
            this.setStatus('Ход противника...');
        }
    },

    // Отрисовка миниатюр флота
    initFleet(containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        const ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
        ships.forEach(size => {
            const shipDiv = document.createElement('div');
            shipDiv.className = `mini-ship size-${size}`;
            for(let i=0; i<size; i++){
                const cell = document.createElement('div');
                cell.className = 'mini-cell';
                shipDiv.appendChild(cell);
            }
            container.appendChild(shipDiv);
        });
    },

    markShipSunk(containerId, size) {
        const container = document.getElementById(containerId);
        const ship = Array.from(container.querySelectorAll(`.mini-ship.size-${size}:not(.sunk)`))[0];
        if (ship) {
            ship.classList.add('sunk');
        }
    },

    showGameOver(message) {
        document.getElementById('modal-title').textContent = message;
        document.getElementById('game-over-modal').style.display = 'flex';
        document.getElementById('btn-rematch').disabled = false;
    },

    hideGameOver() {
        document.getElementById('game-over-modal').style.display = 'none';
    }
};