class Note {
  constructor(freq, _o, _y, _h) {
    this.freq = freq;

    this.note = new p5.Oscillator();
    this.note.setType('sine');
    this.note.freq(freq);
    this.note.amp(0);
    this.note.start();

    this.counter = 0;

    this.o = _o;
    this.x = this.o * ow;
    this.y = _y;
    this.rh = _h;
    this.h = this.rh * mult;
    this._rh = this.rh;

  }

  // Destination height and weight
  modulate(d, w) {
    let step = (d - this.rh) * w;
    this._rh += step;
  }
  // Update the position and height of note
  updateY(y) {
    this.y = y;
    this.rh = this._rh;
    this.h = this.rh * mult;
  }

  updateX() {
    this.x = (this.o - xshift) * ow;
  }

  update() {
    this.note.amp(NMULT * this.counter / mult, 0.05);
  }

  show() {
    stroke(0, 0, 100, 50);
    fill(100, this.counter, this.counter);
    rect(this.x, this.y, ow, this.h);
  }

  play() {
    this.counter++;
    this.update();
  }

  pause() {
    if (this.counter > 0) this.counter--;
    this.update();
  }

  contains(loc) {
    return loc.x > this.x && loc.x < this.x + ow && loc.y > this.y && loc.y < this.y + this.h;
  }

  run(players) {
    this.x = this.o * ow;
    let isPlaying = false;
    for (let p = 0; p < players.length; p++) {
      let player = players[p];
      if (this.contains(player)) {
        //console.log(this.freq, p, this.counter);
        this.play();
        isPlaying = true;
      }
    }
    if (!isPlaying) this.pause();
  }
}
