class Game {
    constructor(gameId) {
        this.gameId = gameId;
        this.players = [];
        this.turn = null;
    }

    addPlayer(playerId) {
        if (this.players.length < 2) {
            this.players.push(playerId);
        }
    }
}

module.exports = Game;