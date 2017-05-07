function Star(x, y, size, velocity){
  this.x = x;
  this.y = y;
  this.size = size;
  this.velocity = velocity;
}
function Starfield(){
  this.fps = 30;
  this.canvas = null;
  this.width = 0;
  this.height = 0;
  this.minVelocity = 15;
  this.maxVelocity = 30;
  this.stars = 100;
  this.intervalId = 0;
}
Starfield.prototype.init = function (div) {
  var self = this;

  this.containerDiv = div;
  self.width = $(this.containerDiv).innerWidth();
  self.height = $(this.containerDiv).innerHeight();

  $(window).resize(function(e){
    self.width = $(this.containerDiv).innerWidth();
    self.height = $(this.containerDiv).innerHeight();
    self.canvas.width = self.width;
    self.canvas.height = self.height;
    self.draw();
  });

  var canvas = $('<canvas></canvas>').get(0);
  $(div).append(canvas);
  this.canvas = canvas;
  this.canvas.width = this.width;
  this.canvas.height = this.height;
};
Starfield.prototype.start = function () {
  var self = this;
  //creamos las estrellas chidas
  var stars = [];
  for (var i = 0; i < this.stars; i++) {
    stars[i] = new Star(
      Math.random()*this.width,
      Math.random()*this.height,
      Math.random()*3,
      (Math.random()*(this.maxVelocity - this.minVelocity))+this.minVelocity
    );
  }
  this.stars = stars;
  //creamos el ciclo
  this.intervalId = setInterval(function () {
    self.update();
    self.draw();
  }, 1000/this.fps);
};
Starfield.prototype.update = function () {
  var dt = 1/this.fps;
  for (var i = 0; i < this.stars.length; i++) {
    var star = this.stars[i];
    star.y += dt*star.velocity;
    if (star.y > this.height) {
      this.stars[i] = new Star(
        Math.random()*this.width,
        0,
        Math.random()*3,
        (Math.random()*(this.maxVelocity - this.minVelocity))+this.minVelocity
      );
    }
  }
};
Starfield.prototype.draw = function () {
  var ctx = this.canvas.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,this.width,this.height);

  ctx.fillStyle = '#fff';
  for (var i = 0; i < this.stars.length; i++) {
    var star = this.stars[i];
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }
  /* CON ESTO DIBUJAMOS EL FONDO
  var background = new Image();
  background.src = 'resources/img/space.jpg';
  background.onload = function(){
    ctx.drawImage(background,0,0);
  }*/
};
