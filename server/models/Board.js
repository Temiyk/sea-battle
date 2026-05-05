class Board {
    constructor() {
        this.grid = Array(10).fill(null).map(() => Array(10).fill('empty'));
        this.ships = [];
    }

    placeShip(ship, x, y, isVertical){
        //
    }

    receiveAttack(x, y) {

    }
}
module.exports = Board;