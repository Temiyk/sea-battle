const UI = {
    renderBoard(boardElementId, isEnemy = false) {
        const board = document.getElementById(boardElementId);
        board.innerHTML = '';

        for (let y = 0; y < 10; y++){
            for (let x = 0; x < 10; x++){
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = x;
                cell.dataset.y = y;
                board.appendChild(cell);
            }
        }
    },

    showGameArea(){
        document.getElementById('lobby').style.display = 'none';
        document.getElementById('game-area').style.display = 'block';
    }
}