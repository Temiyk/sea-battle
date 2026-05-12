document.addEventListener('DOMContentLoaded', () => {
    const Placement = {
        grid: Array(10).fill(null).map(() => Array(10).fill(null)),
        shipsToPlace: [4, 3, 3, 2, 2, 2, 1, 1, 1, 1],
        placedShips: [],
        draggedShipSize: 0,
        draggedShipElement: null,

        draggedShipId: null,
        draggedShipIsHoriz: true,

        init() {
            this.reset();
            this.bindEvents();
        },

        reset() {
            this.grid = Array(10).fill(null).map(() => Array(10).fill(null));
            this.placedShips = [];
            UI.renderBoard('placement-board');
            this.renderDock();
            this.updateStatus();
        },

        renderDock() {
            const dock = document.getElementById('ship-dock');
            dock.innerHTML = '';

            const counts = {};
            this.shipsToPlace.forEach(s => counts[s] = (counts[s] || 0) + 1);
            this.placedShips.forEach(s => counts[s.size]--);

            [4, 3, 2, 1].forEach(size => {
                for(let i = 0; i < counts[size]; i++) {
                    const ship = document.createElement('div');
                    ship.className = 'dock-ship';
                    ship.draggable = true;
                    ship.dataset.size = size;

                    for(let j = 0; j < size; j++) {
                        const c = document.createElement('div');
                        c.className = 'cell ship';
                        ship.appendChild(c);
                    }
                    dock.appendChild(ship);
                }
            });
        },

        updateStatus() {
            const btnReady = document.getElementById('btn-ready');
            if (this.placedShips.length < this.shipsToPlace.length) {
                btnReady.disabled = true;
            } else {
                btnReady.disabled = false;
            }
        },

        canPlaceShip(x, y, size, isHoriz, ignoreId = null) {
            for (let i = 0; i < size; i++) {
                const cx = isHoriz ? x + i : x;
                const cy = isHoriz ? y : y + i;
                if (cx < 0 || cx >= 10 || cy < 0 || cy >= 10) return false;

                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const nx = cx + dx, ny = cy + dy;
                        if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10) {
                            const cell = this.grid[ny][nx];
                            if (cell !== null && cell !== ignoreId) return false;
                        }
                    }
                }
            }
            return true;
        },

        removeShip(id) {
            const index = this.placedShips.findIndex(s => s.id === id);
            if (index !== -1) {
                const ship = this.placedShips[index];
                ship.coords.forEach(([cx, cy]) => this.grid[cy][cx] = null);
                this.placedShips.splice(index, 1);
            }
        },

        placeShip(x, y, size, isHoriz) {
            const id = Date.now() + Math.random();
            const coords = [];
            for (let i = 0; i < size; i++) {
                const cx = isHoriz ? x + i : x;
                const cy = isHoriz ? y : y + i;
                this.grid[cy][cx] = id;
                coords.push([cx, cy]);
            }
            this.placedShips.push({ id, x, y, size, isHoriz, coords });
            this.render();
            this.renderDock();
            this.updateStatus();
        },

        rotateShip(shipId) {
            const shipIndex = this.placedShips.findIndex(s => s.id === shipId);
            if (shipIndex === -1) return;
            const ship = this.placedShips[shipIndex];

            if (this.canPlaceShip(ship.x, ship.y, ship.size, !ship.isHoriz, ship.id)) {
                ship.coords.forEach(([cx, cy]) => this.grid[cy][cx] = null);
                ship.isHoriz = !ship.isHoriz;
                ship.coords = [];
                for (let i = 0; i < ship.size; i++) {
                    const cx = ship.isHoriz ? ship.x + i : ship.x;
                    const cy = ship.isHoriz ? ship.y : ship.y + i;
                    this.grid[cy][cx] = ship.id;
                    ship.coords.push([cx, cy]);
                }
                this.render();
            }
        },

        placeRandomly() {
            this.reset();
            for (const size of this.shipsToPlace) {
                let placed = false;
                while (!placed) {
                    const isHoriz = Math.random() < 0.5;
                    const x = Math.floor(Math.random() * (isHoriz ? 11 - size : 10));
                    const y = Math.floor(Math.random() * (isHoriz ? 10 : 11 - size));

                    if (this.canPlaceShip(x, y, size, isHoriz)) {
                        this.placeShip(x, y, size, isHoriz);
                        placed = true;
                    }
                }
            }
        },

        clearHovers() {
            document.querySelectorAll('.hover-valid, .hover-invalid').forEach(el => {
                el.classList.remove('hover-valid', 'hover-invalid');
            });
        },

        render() {
            UI.renderBoard('placement-board');
            const allCoords = this.placedShips.map(s => s.coords);
            UI.showShips('placement-board', allCoords);

            const board = document.getElementById('placement-board');
            this.placedShips.forEach(ship => {
                ship.coords.forEach(([x, y]) => {
                    const cell = board.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
                    if (cell) {
                        cell.dataset.shipId = ship.id;
                        cell.draggable = true;
                    }
                });
            });
        },

        getPlacedShipsCoords() {
            return this.placedShips.map(s => s.coords);
        },

        bindEvents() {
            const board = document.getElementById('placement-board');
            const dock = document.getElementById('ship-dock');

            dock.addEventListener('dragstart', (e) => {
                const dockShip = e.target.closest('.dock-ship');
                if (dockShip) {
                    this.draggedShipSize = parseInt(dockShip.dataset.size);
                    this.draggedShipId = null;
                    this.draggedShipIsHoriz = true;
                    e.dataTransfer.setData('text/plain', this.draggedShipSize);
                }
            });

            board.addEventListener('dragstart', (e) => {
                if (e.target.classList.contains('ship')) {
                    const shipId = parseFloat(e.target.dataset.shipId);
                    const ship = this.placedShips.find(s => s.id === shipId);
                    if (ship) {
                        this.draggedShipSize = ship.size;
                        this.draggedShipId = ship.id;
                        this.draggedShipIsHoriz = ship.isHoriz;
                    }
                }
            });

            board.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (!e.target.classList.contains('cell')) return;

                this.clearHovers();
                const x = parseInt(e.target.dataset.x);
                const y = parseInt(e.target.dataset.y);

                const isValid = this.canPlaceShip(x, y, this.draggedShipSize, this.draggedShipIsHoriz, this.draggedShipId);

                for (let i = 0; i < this.draggedShipSize; i++) {
                    const cx = this.draggedShipIsHoriz ? x + i : x;
                    const cy = this.draggedShipIsHoriz ? y : y + i;
                    if (cx >= 0 && cx < 10 && cy >= 0 && cy < 10) {
                        const cell = board.querySelector(`.cell[data-x="${cx}"][data-y="${cy}"]`);
                        if (cell) {
                            cell.classList.add(isValid ? 'hover-valid' : 'hover-invalid');
                        }
                    }
                }
            });

            board.addEventListener('dragleave', (e) => {
                if (e.relatedTarget && !board.contains(e.relatedTarget)) {
                    this.clearHovers();
                }
            });

            board.addEventListener('drop', (e) => {
                e.preventDefault();
                this.clearHovers();
                if (!e.target.classList.contains('cell')) return;

                const x = parseInt(e.target.dataset.x);
                const y = parseInt(e.target.dataset.y);

                if (this.canPlaceShip(x, y, this.draggedShipSize, this.draggedShipIsHoriz, this.draggedShipId)) {
                    if (this.draggedShipId) {
                        this.removeShip(this.draggedShipId);
                    }
                    this.placeShip(x, y, this.draggedShipSize, this.draggedShipIsHoriz);
                }
            });

            board.addEventListener('click', (e) => {
                if (e.target.classList.contains('ship')) {
                    const shipId = parseFloat(e.target.dataset.shipId);
                    if (shipId) {
                        this.rotateShip(shipId);
                    }
                }
            });

            document.getElementById('btn-randomize').addEventListener('click', () => {
                this.placeRandomly();
            });
        }
    };

    window.Placement = Placement;

    UI.showPlacement();
    Placement.init();

    document.getElementById('btn-reset').addEventListener('click', () => {
        Placement.reset();
    });

    document.getElementById('btn-ready').addEventListener('click', () => {
        Network.myShips = Placement.getPlacedShipsCoords();
        if (Network.isRematch) {
            socket.emit('submitNewShips', { gameId: Network.gameId, ships: Network.myShips });
            UI.showLobby();
            document.getElementById('lobby-controls').classList.add('hidden');
            document.getElementById('btn-back-to-placement').classList.remove('hidden');
            UI.setLobbyStatus('Ожидание готовности противника...');
        } else {
            UI.showLobby();
            document.getElementById('btn-back-to-placement').classList.remove('hidden');
        }
    });

    document.getElementById('btn-back-to-placement').addEventListener('click', () => {
        document.getElementById('btn-back-to-placement').classList.add('hidden');
        document.getElementById('lobby-controls').classList.remove('hidden');
        UI.setLobbyStatus('');
        UI.showPlacement();
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
            if (e.target.classList.contains('hit') || e.target.classList.contains('miss')) {
                return;
            }

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