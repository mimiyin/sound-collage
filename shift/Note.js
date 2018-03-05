var Note = function () {
  this.counter = 0;
  this.volume = 0;

  Note.prototype.run = function (isOn) {
    this.counter += isOn ? 1 : -1;
    this.fade();
  }

  Note.prototype.fade = function () {
    var newVolume = pow(VOLUME_MAX, (this.counter / DURATION_MAX));
    newVolume = max(0, newVolume);
    if (this.counter > 0) console.log(this.counter, newVolume);
    //console.log(newVolume > this.volume ? "+" : "-");
    this.volume = newVolume;
    this.setVolume();
  }

  Note.prototype.isDead = function () {
    return this.volume <= 0.05;
  }
}

var Sound = function (ratio, sound) {
  Note.call(this);
  var s = sound;
  s.rate(ratio);

  // Always start at the beginning
  this.play = function () {
    s.jump(0);
    s.play();
  }

  this.start = function () {
    s.loop();
  }

  this.stop = function () {
    s.stop();
  }


  this.pause = function () {
    s.pause();
  }

  this.setVolume = function () {
    s.setVolume(this.volume);
  }

  this.setVolume();
}

Sound.prototype = Object.create(Note.prototype);
Sound.constructor = Sound;

var Tone = function (base, ratio) {
  Note.call(this);
  var freq = base * ratio;
  // create web audio api context
  // create Oscillator node
  // var t = audioCtx.createOscillator();
  // t.type = 'sine';
  // t.frequency.value = freq; // value in hertz
  // t.connect(audioCtx.destination);
  //
  // var g = audioCtx.createGain();

  //oscillator.start();
  var t = new p5.Oscillator();
  t.setType('sine');
  t.freq(freq);

  this.start = function () {
    console.log("PLAY NOTE");
    t.start();
  }

  this.stop = function () {
    console.log("STOP NOTE");
    t.stop();
  }

  this.setVolume = function () {
    //console.log("SET VOLUME", this.volume);
    t.amp(this.volume);
    //g.gain.value = this.volume;

  }

  this.setVolume();
  this.start();
}

Tone.prototype = Object.create(Note.prototype);
Tone.constructor = Tone;