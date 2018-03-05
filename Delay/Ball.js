class Ball {
  constructor(x, y, w, h, xspeed, yspeed) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.xspeed = xspeed;
    this.yspeed = yspeed;
  }

  run() {
    this.update();
    this.display();
  }

  //Update function
  update() {
    this.x += this.xspeed;
    this.y += this.yspeed;
    this.xspeed = bounce(this.x, this.xspeed, 0, width);
    this.yspeed = bounce(this.y, this.yspeed, 0, height);
  }

  // Display function
  display() {
    fill(255, 0, 0);
    noStroke
    ellipse(this.x, this.y, this.w, this.h);
  }
}

//Bounce function
function bounce(position, speed, min, max) {
  if (position < min || position > max) {
    speed *= -1;
  }

  return speed;
}