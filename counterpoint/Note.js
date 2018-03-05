var Note = function (freq, _x, _y, _w, _h) {

  var n = new p5.Oscillator();
  n.setType('sine');
  n.freq(freq);
  n.amp(0);
  n.start();

  var isPlaying = false;
  var counter = 0;

  var x = _x;
  var y = _y;
  var w = _w;
  var h = _h;

  var col = 'white';

  function show() {
    stroke(0);
    fill(col);
    rect(x, y, w, h);
  }

  function play() {
    counter++;
    n.amp(counter / 100);
    if (!isPlaying) isPlaying = true;

  }

  function pause() {
    if (counter > 0) counter--;
    n.amp(counter / 100);
    if (isPlaying) isPlaying = false;
  }

  this.run = function (walkers) {
    var hasWalker = false;
    var walkerIndex = -1;
    for (var wlk = 0; wlk < walkers.length; wlk++) {
      var walker = walkers[wlk];
      var pos = walker.getPos();
      var wsz = walker.getSize();
      var index = walker.getIndex();
      if (pos.x > x - (wsz.x / 2) && pos.x < x + w + (wsz.x / 2) && pos.y > y - (wsz.y / 2) && pos.y < y + h + (wsz.y / 2)) {
        col = color(255, 255 - counter, 255 - counter);
        if (!hasWalker) play();
        hasWalker = true;
        walkerIndex = index;
      }
    }
    if (!hasWalker) {
      pause();
    }
    col = color(255, 255 - counter, 255 - counter);
    show();
  }
}