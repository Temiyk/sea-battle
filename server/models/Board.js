const Ship = require('./Ship');

class Board {
    constructor() {
        this.grid = Array(10).fill(null).map(() => Array(10).fill(null));
        this.ships = [];
        this.shots = new Set();
    }

    placeRandomShips(){
        const shipSizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
        for (const size of shipSizes) {
            this.placeShipRandomly(size);
        }
    }

    placeShipRandomly(size) {
        let placed = false;
        while (!placed) {
            const vertical = Math.random() < 0.5;
            const maxX = vertical ? 10 : 10 - size;
            const maxY = vertical ? 10 - size : 10;
            const x = Math.floor(Math.random() * maxX);
            const y = Math.floor(Math.random() * maxY);
            if (this.canPlaceShip(x, y, size, vertical)) {
                this.placeShip(new Ship(size), x, y, vertical);
                placed = true;
            }
        }
    }

    canPlaceShip(x, y, size, isVertical) {
        for (let i = 0; i < size; i++) {
            const cx = isVertical ? x : x + i;
            const cy = isVertical ? y + i : y;

            if (cx < 0 || cx >= 10 || cy < 0 || cy >= 10) return false;

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const nx = cx + dx;
                    const ny = cy + dy;
                    if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10) {
                        if (this.grid[ny][nx] !== null) return false;
                    }
                }
            }
        }
        return true;
    }

    placeShip(ship, x, y, isVertical) {
        const coords = [];
        for (let i = 0; i < ship.length; i++) {
            const cx = isVertical ? x : x + i;
            const cy = isVertical ? y + i : y;
            this.grid[cy][cx] = ship;
            coords.push([cx, cy]);
        }
        ship.setCoordinates(coords);
        this.ships.push(ship);
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