const Board = require("./Board");

class Game {
    constructor(gameId) {
        this.gameId = gameId;
        this.players = [];
        this.boards = {};
        this.turn = null;
        this.started = false;
    }

    addPlayer(playerId) {
        if (this.players.length < 2) {
            this.players.push(playerId);
        }
    }

    start(){
        if(this.players.length !== 2) return;
        this.players.forEach(id => {
           const board = new Board();
           board.placeRandomShips();
           this.boards[id] = board;
        });
        this.turn = this.players[0];
        this.started = true;
    }

    getBoardForPlayer(playerId) {
        const board = this.boards[playerId];
        return {
            ships: board.getShipsCoordinates()
        };
    }

    handleShot(shooterId, x, y){
        if(!this.started) return {error: 'Игра не начата!'};
        if(shooterId !== this.turn) return {error: 'Не ваш ход'};
        const opponentId = this.players.find(p => p !== shooterId);
        const result = this.boards[opponentId].receiveAttack(x, y);
        if(!result) return {error: 'Клетка закрашена!'};

        if(result.status === 'miss') this.turn = opponentId;

        return {
            x, y,
            result: result.status,
            sunkenShipCoords: result.sunkenShipCoords,
            surroundings: result.surroundings
        };
    }

    isGameOver() {
        const opponentId = this.players.find(p => p !== this.turn);
        return this.boards[opponentId].areAllShipsSunk();
    }
}

module.exports = Game;