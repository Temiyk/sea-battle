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
        if (cell) {
            cell.classList.add(className);
        }
    },

    setStatus(text) {
        const status = document.getElementById('status');
        if (status) status.textContent = text;
    },

    showGameArea() {
        document.getElementById('lobby').style.display = 'none';
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

    showGameOver(message) {
        document.getElementById('modal-title').textContent = message;
        document.getElementById('game-over-modal').style.display = 'flex';
        document.getElementById('btn-rematch').disabled = false;
    },

    hideGameOver() {
        document.getElementById('game-over-modal').style.display = 'none';
    }
};