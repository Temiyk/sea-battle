document.addEventListener('DOMContentLoaded', () => {
    const Placement = {
        grid: Array(10).fill(null).map(() => Array(10).fill(null)),
        shipsToPlace: [4, 3, 3, 2, 2, 2, 1, 1, 1, 1],
        currentShipIndex: 0,
        isHorizontal: true,
        placedShipsCoords: [],

        init() {
            UI.renderBoard('placement-board');
            this.bindEvents();
            this.updateStatus();
        },

        updateStatus() {
            const statusEl = document.getElementById('placement-status');
            const btnReady = document.getElementById('btn-ready');
            if (this.currentShipIndex < this.shipsToPlace.length) {
                statusEl.textContent = `Расстановка: корабль ${this.shipsToPlace[this.currentShipIndex]}-палубный`;
                btnReady.disabled = true;
            } else {
                statusEl.textContent = 'Флот готов к бою!';
                btnReady.disabled = false;
            }
        },

        canPlaceShip(x, y, size, isHoriz) {
            for (let i = 0; i < size; i++) {
                const cx = isHoriz ? x + i : x;
                const cy = isHoriz ? y : y + i;
                if (cx < 0 || cx >= 10 || cy < 0 || cy >= 10) return false;

                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const nx = cx + dx, ny = cy + dy;
                        if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10) {
                            if (this.grid[ny][nx] !== null) return false;
                        }
                    }
                }
            }
            return true;
        },

        placeRandomly() {
            this.grid = Array(10).fill(null).map(() => Array(10).fill(null));
            this.placedShipsCoords = [];

            for (const size of this.shipsToPlace) {
                let placed = false;
                while (!placed) {
                    const isHoriz = Math.random() < 0.5;
                    const x = Math.floor(Math.random() * (isHoriz ? 11 - size : 10));
                    const y = Math.floor(Math.random() * (isHoriz ? 10 : 11 - size));

                    if (this.canPlaceShip(x, y, size, isHoriz)) {
                        const coords = [];
                        for (let i = 0; i < size; i++) {
                            const cx = isHoriz ? x + i : x;
                            const cy = isHoriz ? y : y + i;
                            this.grid[cy][cx] = 'ship';
                            coords.push([cx, cy]);
                        }
                        this.placedShipsCoords.push(coords);
                        placed = true;
                    }
                }
            }
            this.currentShipIndex = this.shipsToPlace.length;
            this.render();
            this.updateStatus();
        },

        render() {
            UI.renderBoard('placement-board');
            UI.showShips('placement-board', this.placedShipsCoords);
        },

        bindEvents() {
            const board = document.getElementById('placement-board');

            document.getElementById('btn-rotate').addEventListener('click', () => {
                this.isHorizontal = !this.isHorizontal;
                document.getElementById('btn-rotate').textContent = `Поворот: ${this.isHorizontal ? 'Горизонтально' : 'Вертикально'}`;
            });

            document.getElementById('btn-randomize').addEventListener('click', () => {
                this.placeRandomly();
            });

            board.addEventListener('mouseover', (e) => {
                if (this.currentShipIndex >= this.shipsToPlace.length) return;
                if (!e.target.classList.contains('cell')) return;

                const x = parseInt(e.target.dataset.x);
                const y = parseInt(e.target.dataset.y);
                const size = this.shipsToPlace[this.currentShipIndex];
                const valid = this.canPlaceShip(x, y, size, this.isHorizontal);

                for (let i = 0; i < size; i++) {
                    const cx = this.isHorizontal ? x + i : x;
                    const cy = this.isHorizontal ? y : y + i;
                    const cell = board.querySelector(`.cell[data-x="${cx}"][data-y="${cy}"]`);
                    if (cell) cell.classList.add(valid ? 'hover-valid' : 'hover-invalid');
                }
            });

            board.addEventListener('mouseout', (e) => {
                const cells = board.querySelectorAll('.cell');
                cells.forEach(c => {
                    c.classList.remove('hover-valid');
                    c.classList.remove('hover-invalid');
                });
            });

            board.addEventListener('click', (e) => {
                if (this.currentShipIndex >= this.shipsToPlace.length) return;
                if (!e.target.classList.contains('cell')) return;

                const x = parseInt(e.target.dataset.x);
                const y = parseInt(e.target.dataset.y);
                const size = this.shipsToPlace[this.currentShipIndex];

                if (this.canPlaceShip(x, y, size, this.isHorizontal)) {
                    const coords = [];
                    for (let i = 0; i < size; i++) {
                        const cx = this.isHorizontal ? x + i : x;
                        const cy = this.isHorizontal ? y : y + i;
                        this.grid[cy][cx] = 'ship';
                        coords.push([cx, cy]);
                    }
                    this.placedShipsCoords.push(coords);
                    this.currentShipIndex++;
                    this.render();
                    this.updateStatus();
                }
            });
        }
    };

    UI.showPlacement();
    Placement.init();

    document.getElementById('btn-ready').addEventListener('click', () => {
        Network.myShips = Placement.placedShipsCoords;
        UI.showLobby();
    });

    document.getElementById('btn-create').addEventListener('click', () => {
        Network.createGame();
    });

    document.getElementById('btn-join').addEventListener('click', () => {
        const roomId = document.getElementById('room-id').value.trim();
        if (roomId) Network.joinGame(roomId);
    });

    document.getElementById('enemy-board').addEventListener('click', (e) => {
        if (!Network.isMyTurn) return;
        if (e.target.classList.contains('cell')) {
            const x = parseInt(e.target.dataset.x);
            const y = parseInt(e.target.dataset.y);
            Network.shoot(x, y);
        }
    });

    document.getElementById('btn-rematch').addEventListener('click', () => {
        Network.requestRematch();
        UI.setStatus('Ожидание ответа противника...');
        document.getElementById('btn-rematch').disabled = true;
    });

    document.getElementById('btn-menu').addEventListener('click', () => {
        Network.leaveRoom();
        window.location.reload();
    });
});