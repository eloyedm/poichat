var keyboard = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  PAUSE: 19,
  CAPS_LOCK: 20,
  ESCAPE: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT_ARROW: 37,
  UP_ARROW: 38,
  RIGHT_ARROW: 39,
  DOWN_ARROW: 40,
  INSERT: 45,
  DELETE: 46,
  KEY_0: 48,
  KEY_1: 49,
  KEY_2: 50,
  KEY_3: 51,
  KEY_4: 52,
  KEY_5: 53,
  KEY_6: 54,
  KEY_7: 55,
  KEY_8: 56,
  KEY_9: 57,
  KEY_A: 65,
  KEY_B: 66,
  KEY_C: 67,
  KEY_D: 68,
  KEY_E: 69,
  KEY_F: 70,
  KEY_G: 71,
  KEY_H: 72,
  KEY_I: 73,
  KEY_J: 74,
  KEY_K: 75,
  KEY_L: 76,
  KEY_M: 77,
  KEY_N: 78,
  KEY_O: 79,
  KEY_P: 80,
  KEY_Q: 81,
  KEY_R: 82,
  KEY_S: 83,
  KEY_T: 84,
  KEY_U: 85,
  KEY_V: 86,
  KEY_W: 87,
  KEY_X: 88,
  KEY_Y: 89,
  KEY_Z: 90,
  LEFT_META: 91,
  RIGHT_META: 92,
  SELECT: 93,
  NUMPAD_0: 96,
  NUMPAD_1: 97,
  NUMPAD_2: 98,
  NUMPAD_3: 99,
  NUMPAD_4: 100,
  NUMPAD_5: 101,
  NUMPAD_6: 102,
  NUMPAD_7: 103,
  NUMPAD_8: 104,
  NUMPAD_9: 105,
  MULTIPLY: 106,
  ADD: 107,
  SUBTRACT: 109,
  DECIMAL: 110,
  DIVIDE: 111,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  NUM_LOCK: 144,
  SCROLL_LOCK: 145,
  SEMICOLON: 186,
  EQUALS: 187,
  COMMA: 188,
  DASH: 189,
  PERIOD: 190,
  FORWARD_SLASH: 191,
  GRAVE_ACCENT: 192,
  OPEN_BRACKET: 219,
  BACK_SLASH: 220,
  CLOSE_BRACKET: 221,
  SINGLE_QUOTE: 222
}
//Creates an instance of the Game class.
function Game() {
  this.config = {
    bombRate: 0.05,
    bombMinVelocity: 50,
    bombMaxVelocity: 50,
    invaderInitialVelocity: 25,
    invaderAcceleration: 0,
    invaderDropDistance: 20,
    rocketVelocity: 120,
    rocketMaxFireRate: 2,
    gameWidth: 400,
    gameHeight: 300,
    fps: 50,
    debugMode: false,
    invaderRanks: 5,
    invaderFiles: 10,
    shipSpeed: 120,
    levelDifficultyMultiplier: 0.2,
    pointsPerInvader: 5,
    addVel: 0,
    isExterminated: false
  }

  this.lives = 3;
  this.width = 0;
  this.height = 0;
  this.gameBounds = {left: 0, top: 0, right: 0, bottom: 0};
  this.intervalId = 0;
  this.score = 0;
  this.level = 1;

  this.stateStack = [];

  this.pressedKeys = {};
  this.gameCanvas =  null;

  this.sounds = null;
};
Game.prototype.init = function(gameCanvas) {
  this.gameCanvas = gameCanvas;

  this.width = gameCanvas.width;
  this.height = gameCanvas.height;

  this.gameBounds = {
    left: gameCanvas.width / 2 - this.config.gameWidth / 2,
    right: gameCanvas.width / 2 + this.config.gameWidth / 2,
    top: gameCanvas.height / 2 - this.config.gameHeight / 2,
    bottom: gameCanvas.height / 2 + this.config.gameHeight / 2,
  };
};
Game.prototype.moveToState = function(state) {
  var game = this;

  if(this.currentState() && this.currentState().leave) {
    this.currentState().leave(game);
    this.stateStack.pop();
  }

  if(state.enter) {
    state.enter(game);
  }

  this.stateStack.pop();
  this.stateStack.push(state);
};
Game.prototype.start = function() {
  this.moveToState(new WelcomeState());

  this.lives = 3;
  this.config.debugMode = /debug=true/.test(window.location.href);

  var game = this;
  this.intervalId = setInterval(function () {
    GameLoop(game);
  }, 1000 / this.config.fps);
};
Game.prototype.currentState = function() {
  return this.stateStack.length > 0 ? this.stateStack[this.stateStack.length - 1] : null;
};
Game.prototype.mute = function(mute) {
  if(mute === true) {
    this.sounds.mute = true;
  } else if (mute === false) {
    this.sounds.mute = false;
  } else {
    this.sounds.mute = this.sounds.mute ? false : true;
  }
};
Game.prototype.pushState = function(state) {
  if(state.enter) {
    state.enter(game);
  }
  this.stateStack.push(state);
};
Game.prototype.popState = function() {
  if(this.currentState()) {
    if(this.currentState().leave) {
      this.currentState().leave(game);
    }

    this.stateStack.pop();
  }
};
Game.prototype.stop = function Stop() {
  clearInterval(this.intervalId);
};
Game.prototype.keydown = function(keyCode) {
  this.pressedKeys[keyCode] = true;
  if(this.currentState() && this.currentState().keydown) {
    this.currentState().keydown(this, keyCode);
  }
};
Game.prototype.keyup = function(keyCode) {
  delete this.pressedKeys[keyCode];
  if(this.currentState() && this.currentState().keyup) {
    this.currentState().keyup(this, keyCode);
  }
};
Game.prototype.addVel = function () {
  if (this.stateStack[0].constructor == PlayState) {
    this.stateStack[0].config.addVel += 0.005;
  }
};
Game.prototype.getVel = function () {
  if (this.stateStack[0].constructor == PlayState) {
    if (this.stateStack[0].config.isExterminated) {
      this.stateStack[0].config.isExterminated =  false;
      return this.stateStack[0].config.addVel;
    }
  }
};

function WelcomeState() {}
WelcomeState.prototype.enter = function(game) {
  game.sounds = new Sounds();
  game.sounds.init();
  game.sounds.loadSound('shoot', '../resources/sounds/shoot.wav');
  game.sounds.loadSound('bang', '../resources/sounds/bang.wav');
  game.sounds.loadSound('explosion', '../resources/sounds/explosion.wav');
};
WelcomeState.prototype.update = function (game, dt) {};
WelcomeState.prototype.draw = function(game, dt, ctx) {
  ctx.clearRect(0, 0, game.width, game.height);

  ctx.font="30px Century Gothic";
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline="center";
  ctx.textAlign="center";
  ctx.fillText("Space Invaders", game.width / 2, game.height/2 - 40);
  ctx.font="16px Century Gothic";
  ctx.fillText("Press 'Space' to start.", game.width / 2, game.height/2);
  ctx.font="13px Century Gothic";
  ctx.fillText("By. Eloy, Villegas and Soriano", game.width / 2, game.height/2 + 30);
};
WelcomeState.prototype.keydown = function(game, keyCode) {
  if(keyCode == 32){
    game.level = 1;
    game.score = 0;
    game.lives = 3;
    game.moveToState(new LevelIntroState(game.level));
  }
};

function GameOverState() {}
GameOverState.prototype.update = function(game, dt) {};
GameOverState.prototype.draw = function(game, dt, ctx) {
  ctx.clearRect(0, 0, game.width, game.height);

  ctx.font="30px Century Gothic";
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline="center";
  ctx.textAlign="center";
  ctx.fillText("Game Over!", game.width / 2, game.height/2 - 40);
  ctx.font="16px Century Gothic";
  ctx.fillText("You scored " + game.score + " and got to level " + game.level, game.width / 2, game.height/2);
  ctx.font="16px Century Gothic";
  ctx.fillText("Press 'Space' to play again.", game.width / 2, game.height/2 + 40);
};
GameOverState.prototype.keydown = function(game, keyCode) {
  if(keyCode == 32){
    game.lives = 3;
    game.score = 0;
    game.level = 1;
    game.moveToState(new LevelIntroState(1));
  }
};

function PlayState(config, level) {
  this.config = config;
  this.level = level;

  this.invaderCurrentVelocity =  10;
  this.invaderCurrentDropDistance =  0;
  this.invadersAreDropping =  false;
  this.lastRocketTime = null;

  this.ship = null;
  this.invaders = [];
  this.rockets = [];
  this.bombs = [];
}
PlayState.prototype.enter = function(game) {
  this.ship = new Ship(game.width / 2, game.gameBounds.bottom);

  this.invaderCurrentVelocity =  10;
  this.invaderCurrentDropDistance =  0;
  this.invadersAreDropping =  false;

  var levelMultiplier = this.level * this.config.levelDifficultyMultiplier;
  this.shipSpeed = this.config.shipSpeed;
  this.invaderInitialVelocity = this.config.invaderInitialVelocity + (levelMultiplier * this.config.invaderInitialVelocity);
  this.bombRate = this.config.bombRate + (levelMultiplier * this.config.bombRate);
  this.bombMinVelocity = this.config.bombMinVelocity + (levelMultiplier * this.config.bombMinVelocity);
  this.bombMaxVelocity = this.config.bombMaxVelocity + (levelMultiplier * this.config.bombMaxVelocity);

  var ranks = this.config.invaderRanks;
  var files = this.config.invaderFiles;
  var invaders = [];
  for(var rank = 0; rank < ranks; rank++){
    for(var file = 0; file < files; file++) {
      invaders.push(new Invader(
        (game.width / 2) + ((files/2 - file) * 200 / files),
        (game.gameBounds.top + rank * 20),
        rank, file, 'Invader'));
    }
  }
  this.invaders = invaders;
  this.invaderCurrentVelocity = this.invaderInitialVelocity;
  this.invaderVelocity = {x: -this.invaderInitialVelocity, y:0};
  this.invaderNextVelocity = null;
  this.config.addVel = 0;
};
PlayState.prototype.update = function(game, dt) {
  if(game.pressedKeys[37]) {
    this.ship.x -= this.shipSpeed * dt;
  }
  if(game.pressedKeys[39]) {
    this.ship.x += this.shipSpeed * dt;
  }
  if(game.pressedKeys[32]) {
    this.fireRocket(game);
  }

  if(this.ship.x < game.gameBounds.left) {
    this.ship.x = game.gameBounds.left;
  }
  if(this.ship.x > game.gameBounds.right) {
    this.ship.x = game.gameBounds.right;
  }

  for(var i=0; i<this.bombs.length; i++) {
    var bomb = this.bombs[i];
    bomb.y += dt * bomb.velocity;

    if(bomb.y > this.height) {
      this.bombs.splice(i--, 1);
    }
  }

  for(i=0; i<this.rockets.length; i++) {
    var rocket = this.rockets[i];
    rocket.y -= dt * rocket.velocity;

    if(rocket.y < 0) {
      this.rockets.splice(i--, 1);
    }
  }

  var hitLeft = false, hitRight = false, hitBottom = false;
  for(i=0; i<this.invaders.length; i++) {
    var invader = this.invaders[i];
    var newx = invader.x + this.invaderVelocity.x * (dt + this.config.addVel);
    var newy = invader.y + this.invaderVelocity.y * dt;
    if(hitLeft == false && newx < game.gameBounds.left) {
      hitLeft = true;
    }
    else if(hitRight == false && newx > game.gameBounds.right) {
      hitRight = true;
    }
    else if(hitBottom == false && newy > game.gameBounds.bottom) {
      hitBottom = true;
    }

    if(!hitLeft && !hitRight && !hitBottom) {
      invader.x = newx;
      invader.y = newy;
    }
  }

  if(this.invadersAreDropping) {
    this.invaderCurrentDropDistance += this.invaderVelocity.y * dt;
    if(this.invaderCurrentDropDistance >= this.config.invaderDropDistance) {
      this.invadersAreDropping = false;
      this.invaderVelocity = this.invaderNextVelocity;
      this.invaderCurrentDropDistance = 0;
    }
  }

  if(hitLeft) {
    this.invaderCurrentVelocity += this.config.invaderAcceleration;
    this.invaderVelocity = {x: 0, y:this.invaderCurrentVelocity };
    this.invadersAreDropping = true;
    this.invaderNextVelocity = {x: this.invaderCurrentVelocity , y:0};
  }
  if(hitRight) {
    this.invaderCurrentVelocity += this.config.invaderAcceleration;
    this.invaderVelocity = {x: 0, y:this.invaderCurrentVelocity };
    this.invadersAreDropping = true;
    this.invaderNextVelocity = {x: -this.invaderCurrentVelocity , y:0};
  }
  if(hitBottom) {
    this.lives = 0;
  }

  for(i=0; i<this.invaders.length; i++) {
    var invader = this.invaders[i];
    var bang = false;

    for(var j=0; j<this.rockets.length; j++){
      var rocket = this.rockets[j];

      if(rocket.x >= (invader.x - invader.width/2) && rocket.x <= (invader.x + invader.width/2) &&
      rocket.y >= (invader.y - invader.height/2) && rocket.y <= (invader.y + invader.height/2)) {
        this.rockets.splice(j--, 1);
        bang = true;
        game.score += this.config.pointsPerInvader;
        break;
      }
    }
    if(bang) {
      this.invaders.splice(i--, 1);
      game.sounds.playSound('bang');
      this.config.isExterminated = true;
      console.log(this.config.addVel);
      var event = new CustomEvent('accelerate', { cantity: 0.5 });
      window.dispatchEvent(event);
      /*MANDAMOS UDP CON EL CAMBIO DE VELOCIDAD*/
    }
  }

  var frontRankInvaders = {};
  for(var i=0; i<this.invaders.length; i++) {
    var invader = this.invaders[i];
    if(!frontRankInvaders[invader.file] || frontRankInvaders[invader.file].rank < invader.rank) {
      frontRankInvaders[invader.file] = invader;
    }
  }

  for(var i=0; i<this.config.invaderFiles; i++) {
    var invader = frontRankInvaders[i];
    if(!invader) continue;
    var chance = this.bombRate * dt;
    if(chance > Math.random()) {
      this.bombs.push(new Bomb(invader.x, invader.y + invader.height / 2,
        this.bombMinVelocity + Math.random()*(this.bombMaxVelocity - this.bombMinVelocity)));
    }
  }

  for(var i=0; i<this.bombs.length; i++) {
    var bomb = this.bombs[i];
    if(bomb.x >= (this.ship.x - this.ship.width/2) && bomb.x <= (this.ship.x + this.ship.width/2) &&
    bomb.y >= (this.ship.y - this.ship.height/2) && bomb.y <= (this.ship.y + this.ship.height/2)) {
      this.bombs.splice(i--, 1);
      game.lives--;
      game.sounds.playSound('explosion');
    }
  }

  for(var i=0; i<this.invaders.length; i++) {
    var invader = this.invaders[i];
    if((invader.x + invader.width/2) > (this.ship.x - this.ship.width/2) &&
    (invader.x - invader.width/2) < (this.ship.x + this.ship.width/2) &&
    (invader.y + invader.height/2) > (this.ship.y - this.ship.height/2) &&
    (invader.y - invader.height/2) < (this.ship.y + this.ship.height/2)) {
      game.lives = 0;
      game.sounds.playSound('explosion');
    }
  }

  if(game.lives <= 0) {
    game.moveToState(new GameOverState());
  }

  if(this.invaders.length === 0) {
    game.score += this.level * 50;
    game.level += 1;
    game.moveToState(new LevelIntroState(game.level));
  }
};
PlayState.prototype.draw = function(game, dt, ctx) {
  ctx.clearRect(0, 0, game.width, game.height);

  ctx.fillStyle = '#999999';
  ctx.fillRect(this.ship.x - (this.ship.width / 2), this.ship.y - (this.ship.height / 2), this.ship.width, this.ship.height);

  ctx.fillStyle = '#006600';
  for(var i=0; i<this.invaders.length; i++) {
    var invader = this.invaders[i];
    ctx.fillRect(invader.x - invader.width/2, invader.y - invader.height/2, invader.width, invader.height);
  }

  ctx.fillStyle = '#ff5555';
  for(var i=0; i<this.bombs.length; i++) {
    var bomb = this.bombs[i];
    ctx.fillRect(bomb.x - 2, bomb.y - 2, 4, 4);
  }

  ctx.fillStyle = '#ff0000';
  for(var i=0; i<this.rockets.length; i++) {
    var rocket = this.rockets[i];
    ctx.fillRect(rocket.x, rocket.y - 2, 1, 4);
  }

  var textYpos = game.gameBounds.bottom + ((game.height - game.gameBounds.bottom) / 2) + 14/2;
  ctx.font="14px Century Gothic";
  ctx.fillStyle = '#ffffff';
  var info = "Lives: " + game.lives;
  ctx.textAlign = "left";
  ctx.fillText(info, game.gameBounds.left, textYpos);
  info = "Score: " + game.score + ", Level: " + game.level;
  ctx.textAlign = "right";
  ctx.fillText(info, game.gameBounds.right, textYpos);

  if(this.config.debugMode) {
    ctx.strokeStyle = '#ff0000';
    ctx.strokeRect(0,0,game.width, game.height);
    ctx.strokeRect(game.gameBounds.left, game.gameBounds.top,
      game.gameBounds.right - game.gameBounds.left,
      game.gameBounds.bottom - game.gameBounds.top);
  }
};
PlayState.prototype.keydown = function(game, keyCode) {
  if(keyCode == 32) {
    this.fireRocket();
  }
  if(keyCode == 80) {
    game.pushState(new PauseState());
  }
};
PlayState.prototype.keyup = function(game, keyCode) {};
PlayState.prototype.fireRocket = function(game) {
  if(this.lastRocketTime === null || ((new Date()).valueOf() - this.lastRocketTime) > (1000 / this.config.rocketMaxFireRate)){
    this.rockets.push(new Rocket(this.ship.x, this.ship.y - 12, this.config.rocketVelocity));
    this.lastRocketTime = (new Date()).valueOf();
    game.sounds.playSound('shoot');
  }
};

function PauseState() {}
PauseState.prototype.keydown = function(game, keyCode) {
  if(keyCode == 80) {
    game.popState();
  }
};
PauseState.prototype.draw = function(game, dt, ctx) {
  ctx.clearRect(0, 0, game.width, game.height);
  ctx.font="14px Century Gothic";
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline="middle";
  ctx.textAlign="center";
  ctx.fillText("Paused", game.width / 2, game.height/2);
  return;
};

function LevelIntroState(level) {
  this.level = level;
  this.countdownMessage = "3";
}
LevelIntroState.prototype.update = function(game, dt) {
  if(this.countdown === undefined) {
    this.countdown = 3;
  }
  this.countdown -= dt;
  if(this.countdown < 2) {
    this.countdownMessage = "2";
  }
  if(this.countdown < 1) {
    this.countdownMessage = "1";
  }
  if(this.countdown <= 0) {
    game.moveToState(new PlayState(game.config, this.level));
  }
};
LevelIntroState.prototype.draw = function(game, dt, ctx) {
  ctx.clearRect(0, 0, game.width, game.height);

  ctx.font="36px Century Gothic";
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline="middle";
  ctx.textAlign="center";
  ctx.fillText("Level " + this.level, game.width / 2, game.height/2);
  ctx.font="24px Century Gothic";
  ctx.fillText("Ready in " + this.countdownMessage, game.width / 2, game.height/2 + 36);
  return;
};
function Ship(x, y) {
  this.x = x;
  this.y = y;
  this.width = 20;
  this.height = 16;
}
function Rocket(x, y, velocity) {
  this.x = x;
  this.y = y;
  this.velocity = velocity;
}
function Bomb(x, y, velocity) {
  this.x = x;
  this.y = y;
  this.velocity = velocity;
}
function Invader(x, y, rank, file, type) {
  this.x = x;
  this.y = y;
  this.rank = rank;
  this.file = file;
  this.type = type;
  this.width = 18;
  this.height = 14;
}

function GameState(updateProc, drawProc, keydown, keyup, enter, leave) {
  this.updateProc = updateProc;
  this.drawProc = drawProc;
  this.keydown = keydown;
  this.keyup = keyup;
  this.enter = enter;
  this.leave = leave;
}
function Sounds() {
  this.audioContext = null;
  this.sounds = {};
}
Sounds.prototype.init = function() {
  context = window.AudioContext || window.webkitAudioContext;
  this.audioContext = new context();
  this.mute = false;
};
Sounds.prototype.loadSound = function(name, url) {
  var self = this;
  this.sounds[name] = null;
  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.responseType = 'arraybuffer';
  req.onload = function() {
    self.audioContext.decodeAudioData(req.response, function(buffer) {
      self.sounds[name] = {buffer: buffer};
    });
  };
  try {
    req.send();
  } catch(e) {
    console.log("An exception occured getting sound the sound " + name + " this might be " +
    "because the page is running from the file system, not a webserver.");
    console.log(e);
  }
};
Sounds.prototype.playSound = function(name) {
  if(this.sounds[name] === undefined || this.sounds[name] === null || this.mute === true) {
    return;
  }
  var source = this.audioContext.createBufferSource();
  source.buffer = this.sounds[name].buffer;
  source.connect(this.audioContext.destination);
  source.start(0);
};

function GameLoop(game) {
  var currentState = game.currentState();
  if(currentState) {
    var dt = 1 / game.config.fps;

    var ctx = game.gameCanvas.getContext("2d");

    if(currentState.update) {
      currentState.update(game, dt);
    }
    if(currentState.draw) {
      currentState.draw(game, dt, ctx);
    }
    var vel = game.getVel();
    if (vel !== undefined) {
        game.addVel();
    }
  }
}
