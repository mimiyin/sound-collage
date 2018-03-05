// Different types of walkers
// Mouse walker
// Random walker
// Noisy walker
// Bouncing ball walker
class Walker {

  constructor(x, y) {
    this.noff = random(100, 1000);
    this.x = x;
    this.y = y;
    this.w = 10;
    this.h = this.w;
  }

  run() {
    this.update();
    this.display();
  }

  update() {
    //if(frameCount%FRAMERATE == 0) x = random(width);
    //x += (mouseX-x)*random(0.1);
    //y += (noise((frameCount + noff) * 0.01) - 0.5) * 10;
    this.x += (noise((frameCount + this.noff) * 0.01) - 0.5) * 2;
    this.y += (noise((100 + frameCount + this.noff) * 0.01) - 0.5) * 2;

  }
  display () {
    noStroke();
    fill(255, 0, 0);
    ellipse(this.x, this.y, this.w, this.h);
  }
}