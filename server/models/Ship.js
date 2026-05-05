class Ship {
    constructor(length) {
        this.length = length;
        this.hits = 0;
        this.coordinates = [];
    }

    hit(){
        this.hits++;
    }

    isDead() {
        return this.hits >= this.length;
    }
}
module.exports = Ship;