class Ball {
  float x, y, w, h, xspeed, yspeed, tx, ty;
  int lifespan, counter;

  Ball(float _x, float _y, float _w, float _h, float _xspeed, float _yspeed, int _lifespan) {
    x = _x;
    y = _y;
    w = _w;
    h = _h;
    yspeed = _yspeed;
    lifespan = _lifespan;
    tx = random(1000);
    ty = random(1000);
    counter = 0;
  }

  void run() {
    update();
    display();
  }

  boolean died() {
    return counter > lifespan;
  }

  //Update function
  void update() {
    x += xspeed;
    y += yspeed;
    xspeed = noise(tx) - 0.5;
    yspeed = noise(ty) - 0.5;
    tx += 0.01;
    ty += 0.01;
    counter++;
  }

  // Display function
  void display() {
    fill(100, 100, 100, counter);
    noStroke();
    ellipse(x, y, w, h);
  }
}