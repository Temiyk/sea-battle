const socket = io();

const Network = {
    createGame(){
        socket.emit('createGame');
    },

    shoot(gameId, x, y){
        socket.emit('shoot', {gameId, x, y});
    },
};

socket.on('gameCreated', (data) => {
    console.log(`Игра создана! ID: ${data.gameId}`);
});

socket.on('shotResult', (data) => {
   console.log(`Результат выстрела: `, data);
});