document.addEventListener('DOMContentLoaded', () => {
    UI.renderBoard('my-board');
    UI.renderBoard('enemy-board', true);

    document.getElementById('btn-create').addEventListener('click', (e) => {
        Network.createGame();
        UI.showGameArea();
    });

    document.getElementById('enemy-board').addEventListener('click', (e) => {
        if(e.target.classList.contains('cell')){
            const x = e.target.dataset.x;
            const y = e.target.dataset.y;

            Network.shoot('current', x, y);
        }
    });
})