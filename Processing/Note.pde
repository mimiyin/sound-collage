class Note {
  float freq;
  SinOsc note;
  int counter;

  int o;
  float x, y, rh, _rh, h, vol, pvol;

  Note(PApplet p, float _freq, int _o, float _y, float _h) {
    freq = _freq;

    note = new SinOsc(p);
    note.freq(_freq);
    note.amp(0);
    note.play();

    counter = 0;

    o = _o;
    x = o * ow;
    y = _y;
    rh = _h;
    _rh = rh;
    h = rh * mult;
  }

  // Destination height and weight
  void modulate(float d, float w) {
    float step = (d - rh) * w;
    _rh += step;
  }
  // Update the position and height of note
  void updateY(float _y) {
    y = _y;
    rh = _rh;
    h = rh * mult;
  }

  void updateX() {
    x = (o + xshift_mult) * ow;
  }
  
  void kill() {
   note.stop(); 
  }
  
  void show() {
    stroke(0, 0, 100, 50);
    fill(100, counter, counter);
    rect(x, y, ow, h);
  }

  void update() {
    vol = (NMULT * counter) / mult;
    fadeVolume(note, pvol, vol, 0.05);
    pvol = vol;    
  }

  void play() {
    counter++;
    update();
  }

  void pause() {
    if (counter > 0) counter--;
    update();
  }

  boolean contains(Ball loc) {
    return loc.x > x && loc.x < x + ow && loc.y > y && loc.y < y + h;
  }

  void run(ArrayList <Ball> players) {
    boolean isPlaying = false;
    for (int p = 0; p < players.size(); p++) {
      Ball player = players.get(p);
      if (contains(player)) {
        play();
        isPlaying = true;
      }
    }
    if (!isPlaying) pause();
  }
}