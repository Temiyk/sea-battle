const Ship = require('./Ship');

class Board {
    constructor() {
        this.grid = Array(10).fill(null).map(() => Array(10).fill(null));
        this.ships = [];
        this.shots = new Set();
    }

    loadShips(shipsCoords) {
        shipsCoords.forEach(coords => {
            const ship = new Ship(coords.length);
            coords.forEach(([cx, cy]) => {
                this.grid[cy][cx] = ship;
            });
            ship.setCoordinates(coords);
            this.ships.push(ship);
        });
    }

    reset() {
        this.shots.clear();
        this.ships.forEach(ship => ship.reset());
    }

    receiveAttack(x, y) {
        const key = `${x},${y}`;
        if (this.shots.has(key)) return null;
        this.shots.add(key);

        const target = this.grid[y][x];
        if (target) {
            target.hit();
            const sunk = target.isSunk();
            let surroundings = [];

            if (sunk) {
                const coords = target.getCoordinates();
                coords.forEach(([cx, cy]) => {
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            const nx = cx + dx;
                            const ny = cy + dy;
                            if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10) {
                                const nKey = `${nx},${ny}`;
                                if (!this.shots.has(nKey)) {
                                    this.shots.add(nKey);
                                    surroundings.push({ x: nx, y: ny });
                                }
                            }
                        }
                    }
                });
            }

            return {
                status: 'hit',
                sunkenShipCoords: sunk ? target.getCoordinates() : null,
                surroundings: surroundings
            };
        } else {
            return { status: 'miss', sunkenShipCoords: null, surroundings: [] };
        }
    }

    areAllShipsSunk() {
        return this.ships.every(ship => ship.isSunk());
    }

    getShipsCoordinates() {
        return this.ships.map(ship => ship.getCoordinates());
    }
}

module.exports = Board;