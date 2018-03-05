var Rhythm = function (_beats, _p, _bpm) {

  var calcPosition = function (p, l) {
    return p * l;
  }
  var calcOrientation = function (p) {
    return -p * TWO_PI;
  }

  var calcCurrentBeat = function (pos) {
    return floor(pos);
  }

  var calcSpeed = function (bpm) {
    return bpm / NUM_FPM;
  }

  var beats = _beats;
  var p = _p;
  var pos = calcPosition(p, beats.length);
  var bpm = _bpm;
  var speed = calcSpeed(bpm);

  var currentBeat = calcCurrentBeat(pos);
  var nextBeat = currentBeat;

  var orientation = calcOrientation(p);
  var sz = 100;
  var margin = 10;

  this.getBeats = function () {
    return beats;
  }
  this.getTempo = function () {
    return bpm;
  }

  this.updateBeats = function (_beats) {
    beats = _beats;
    pos = calcPosition(p, beats.length);
  }
  this.updateTempo = function (_bpm) {
    bpm = _bpm;
    speed = calcSpeed(bpm);
  }

  this.rotate = function (_p) {
    p += _p;
    pos -= calcPosition(_p, beats.length);
    currentBeat = calcCurrentBeat(pos);
    orientation -= calcOrientation(_p);

  }

  // Is there a beat?
  this.getNextBeat = function () {
    pos += speed;
    currentBeat = calcCurrentBeat(pos);

    // Calc duratio given bpm and num of beats
    // Beat length of 1 should yield 1 beat given the bpm and framerate
    var calcDuration = function (beatLength, bpm) {
        return beatLength * NUM_FPM / bpm;
      }
      //console.log(nextBeat, currentBeat, angle, pos);
    if (currentBeat >= nextBeat) {
      if (nextBeat >= beats.length) {
        nextBeat = 0;
        pos = 0;
      }
      currentBeat = nextBeat;
      nextBeat++;
      return beats[currentBeat];
    }
    return undefined;
  }

  this.display = function (centerX, centerY) {
    push();
    translate(centerX + sz + margin, centerY);
    rotate(orientation);
    beginShape()
    for (var b = 0; b < beats.length; b++) {
      var a = TWO_PI * b / beats.length;
      var x = cos(a) * sz;
      var y = sin(a) * sz;
      noStroke();
      if (b == currentBeat) fill(255, 0, 0);
      else if (beats[b] > 0) fill(0, 255, 0);
      else fill(0);
      var beatsz = 10;
      ellipse(x, y, beatsz, beatsz);

      noFill();
      strokeWeight(1);
      stroke(0);
      vertex(x, y);

    }
    endShape(CLOSE);
    pop();



  }
}