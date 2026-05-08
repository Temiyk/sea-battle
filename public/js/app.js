document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-create').addEventListener('click', () => {
        Network.createGame();
    });

    document.getElementById('btn-join').addEventListener('click', () => {
        const roomId = document.getElementById('room-id').value.trim();
        if (roomId) {
            Network.joinGame(roomId);
            UI.showGameArea();
            UI.renderBoard('my-board');
            UI.renderBoard('enemy-board');
        }
    });

    document.getElementById('enemy-board').addEventListener('click', (e) => {
        if (!Network.isMyTurn) return;

        if (e.target.classList.contains('cell')) {
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