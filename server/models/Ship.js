class Ship {
    constructor(length) {
        this.length = length;
        this.hits = 0;
        this.coordinates = [];
    }

    setCoordinates(coordinates) {
        this.coordinates = coordinates;
    }

    getCoordinates() {
        return this.coordinates;
    }

    hit(){
        this.hits++;
    }

    isSunk() {
        return this.hits >= this.length;
    }
}

module.exports = Ship;