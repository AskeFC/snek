var uuid = require('./uuid');
var Snake = require('./snake');
var collider = require('./collider');
var getRandom = require('./getrandom');

var Game = function(io) {
  this.io = io;
};

Game.prototype = {
  size : 5,    // starting snake size
  winLength : 10,
  width : 42,   // board width
  height: 28,   // board height
  apples : [],
  
  bombs :  [],
  bombLifeSpan: 40,
  bombRadius: 3,

  snakes : [],
  player : {},

  removePlayer : function(id){
    for(var i = 0 ; i < this.snakes.length; i++) {
      var snake = this.snakes[i];
      if(snake.id === id){
        var snakeIndex = this.snakes.indexOf(snake);
        this.snakes.splice(snakeIndex, 1);
      }
    }
  },

  start : function(data){
    this.addApple();
    this.addApple();
  },

  move : function(){
    var winnerIDs = [];
    for(var i = 0 ; i < this.snakes.length; i++ ){
      var s = this.snakes[i];
      s.move();
      if(s.segments.length >= this.winLength) {
        winnerIDs.push(s.id);
      }
    }

    if(winnerIDs.length > 0){
      this.io.emit('winnerSnakes', winnerIDs);
    }

    this.bombs.forEach(bomb => {
      bomb.timeleft--;
      if (bomb.timeleft <= 0) {
        this.explodeBomb(bomb);
      }
    });
  },

  addSnake : function(data){
    var snakeDetails = {
      id : data.id,
      x: (Math.random() * this.width)  | 0,
      y: (Math.random() * this.height)  | 0,
      color: data.color,
      length: this.size,
    }

    this.io.emit('spawnSnake', snakeDetails);

    var snake = new Snake(snakeDetails, this);
    snake.init();
    this.snakes.push(snake);

    if(this.apples.length == 0) {
      this.addApple();
      this.addApple();
    }
  },

  addApple : function(x, y ){
    var apple = {
      x : parseFloat(x)==x? x : getRandom(0,this.width - 1),
      y : parseFloat(y)==y? y : getRandom(0,this.height - 1),
      id: uuid()
    };
    this.io.emit('addApple', apple);
    this.apples.push(apple);
  },

  removeApple: function(apple){
    var appleIndex = this.apples.indexOf(apple);
    this.apples.splice(appleIndex, 1);
    this.io.emit('removeApple', apple.id);
  },

  addBomb : function(x, y) {
    var bomb = {
      x : parseFloat(x)==x? x : getRandom(0,this.width - 1),
      y : parseFloat(y)==y? y : getRandom(0,this.height - 1),
      id: uuid(),
      timeleft: this.bombLifeSpan
    };
    this.io.emit('addBomb', bomb);
    this.bombs.push(bomb);
  },

  explodeBomb: function(bomb) {
    var x = bomb.x,
        y = bomb.y;

    this.snakes.forEach( (snake,id) => {
      var segments = snake.getSegmentsNear(x,y, this.bombRadius);
      if (segments.length > 0) {
        if (segments.length >= snake.segments.length) {
          snake.die();
        } else {
          segments.forEach(s => snake.loseSegment(s));
        }
      }
    });

    this.removeBomb(bomb);
  },

  removeBomb: function(bomb) {
    var bombIndex = this.bombs.indexOf(bomb);
    this.bombs.splice(bombIndex, 1);
    this.io.emit('removeBomb', bomb.id);
  },

  checkCollisions(){
    //Checks collisions between apples and snakes
    for(var i = 0; i < this.snakes.length; i++){
      var snake = this.snakes[i];
      var head = snake.segments[snake.segments.length - 1];

      for(var j = 0; j < this.apples.length; j++) {
        var apple = this.apples[j];
        if(collider(apple, head)){
          snake.eat();
          this.removeApple(apple);
          this.addApple();
        }
      }
    }
  }
};

module.exports = function(io, players) {
  var game = new Game(io);
  var totalFrames = 0;
  var avgFrame = 0;
  var time = new Date().getTime();
  var elapsedHistory = [];
  var elapsed = 0;
  var ms = 80;

  function move(){
    var now = new Date().getTime();
    var delta = now - time;
    time = now;
    elapsed = elapsed + delta;

    while(elapsed >= ms) {
      io.emit('serverTick', {
        message: elapsed,
        snakes : game.snakes
       });
      elapsed = elapsed - ms;
      totalFrames++;
      game.move();
    }

    setTimeout(move,1);
  }

  move();

  return game;
};
