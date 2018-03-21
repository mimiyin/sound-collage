class Note {
  constructor(freq, _x, _y, _w, _h) {
    this.freq = freq;

    this.note = new p5.Oscillator();
    this.note.setType('sine');
    this.note.freq(freq);
    this.note.amp(0);
    this.note.start();

    this.counter = 0;

    this.x = _x;
    this.y = _y;
    this.w = _w;
    this.rh = _h;
    this.h = this.rh*mult;
    this._rh = this.rh;

  }

  // Destination height and weight
  modulate(d, w) {
    let step = (d - this.rh) * w;
    this._rh += step;
  }
  // Update the position and height of note
  update(y) {
    this.y = y;
    this.rh = this._rh;
    this.h = this.rh*mult;
  }

  show() {
    stroke(0);
    fill(255, 255 - this.counter, 255 - this.counter);
    rect(this.x, this.y, this.w, this.h);
  }

  play() {
    this.counter++;
    this.note.amp(this.counter / mult);
  }

  pause() {
    if (this.counter > 0) this.counter--;
    this.note.amp(this.counter / mult);
  }

  contains(loc) {
    return loc.x > this.x && loc.x < this.x + this.w && loc.y > this.y && loc.y < this.y + this.h;
  }

  run(players) {
    let isPlaying = false;
    for (let p = 0; p < players.length; p++) {
      let player = players[p];
      if (this.contains(player)) {
        //console.log(this.freq, p, this.counter);
        this.play();
        isPlaying = true;
      }
    }
    if(!isPlaying) this.pause();
    this.show();
  }
}