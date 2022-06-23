const socket = io();

socket.on('newChat', (msg) => {
  const snake = getSnake(msg.id);
  if (snake) {
    snake.say(msg.message);
  }
});

socket.on('gameOver', (msg) => {
  const players = msg.players;
  const winner = msg.winner;
  game.gameWon(players,winner);
});

socket.on('gameMode', (msg) => {
  const mode = msg.mode;
  const settings = msg.gameSettings;
  game.setupBoard(settings.width, settings.height, settings.winLength);
  game.changeMode(mode);
});

socket.on('serverTick', (msg) => {
  const snakes = msg.snakes;
  updateSnakes(snakes);
  game.move();
});

socket.on('warpSnake', (msg) => {
  const snake = getSnake(msg.id);
  snake.loadWarp(msg.segments);
});

socket.on('loseHead', (msg) => {
  const snake = getSnake(msg.id);
  snake.loseHead();
});

socket.on('loseSegment', (msg) => {
  const snake = getSnake(msg.id);
  const x = parseInt(msg.x);
  const y = parseInt(msg.y);
  const showParticle = msg.showParticle;
  snake.loseSegment(x, y, showParticle);
});

socket.on('gameSetup', (msg) => {
  const width = parseInt(msg.width);    // board width
  const height = parseInt(msg.height);  // board height
  const id = parseInt(msg.id);          // player id
  const apples = msg.apples;            // apples already in play
  const snakes = msg.snakes;            // snakes already in play
  const winLength = msg.winLength;      // snake length needed to win
  game.setup(width, height, id, apples, snakes, winLength);
});

socket.on('snakeEat', (msg) => {
  const id = msg;
  const snake = getSnake(id);
  snake.eat();
});

socket.on('addApple', (msg) => {
  const x = parseInt(msg.x);
  const y = parseInt(msg.y);
  const id = parseInt(msg.id);
  game.addApple(x,y,id);
});

socket.on('removeApple', (id) => {
  game.removeApple(id);
});

socket.on('addBomb', (msg) => {
  const x = parseInt(msg.x);
  const y = parseInt(msg.y);
  const id = parseInt(msg.id);
  const color = msg.color;
  game.addBomb(x,y,id,color);
});

socket.on('removeBomb', (id) => {
  game.removeBomb(id);
});

socket.on('message', (msg) => {
  console.log(msg.content);
});

socket.on('spawnSnake', (msg) => {
  const id = parseInt(msg.id);
  const x = parseInt(msg.x);
  const y = parseInt(msg.y);
  const color = msg.color;
  const direction = msg.direction;
  const length = msg.length;
  const name = msg.name || "no_name";
  game.addSnake(id, x, y, color, direction, length, name);
});


// When another player disconnects...
socket.on('playerDisconnect', (msg) => {
  game.removePlayer(msg.id);
});

// killSnake - where does this come from
socket.on('killSnake', (msg) => {
  const id = msg.id;
  const x = msg.x;
  const y = msg.y;
  const type = msg.type;
  const snake = getSnake(msg.id);
  if (snake) {
    snake.die(x,y,type);
  };
});
