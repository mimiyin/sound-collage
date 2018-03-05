var Note = function (duration, isFade) {
  this.duration = duration;
  this.isFade = isFade;
  this.counter = 0;
  this.volume = isFade ? 0 : VOLUME_MAX;

  Note.prototype.run = function (isCurrent) {
    if (this.isFade) {
      this.counter += isCurrent ? 1 : -1;
      this.fade();
      return;
    }
    this.counter++;
  }

  Note.prototype.fade = function () {
    var newVolume = pow(VOLUME_MAX, (this.counter / this.duration)) * 0.1;
    //console.log(newVolume > this.volume ? "+" : "-");
    this.volume = newVolume;
    this.setVolume();
  }

  Note.prototype.addDuration = function (d) {
    // var mult = d/this.duration;
    // this.counter = 0;
    this.duration += d;
    console.log("DOUBLE!");
  }

  Note.prototype.isDead = function () {
    return this.isFade ? this.volume <= 0.05 : this.counter > this.duration;
  }
}

var Sound = function (ratio, sound, duration, isFade) {
  Note.call(this, duration, isFade);
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

var Tone = function (base, ratio, duration, isFade) {
  Note.call(this, duration, isFade);
  var freq = base * ratio;
  // create web audio api context
  // create Oscillator node
  var t = audioCtx.createOscillator();
  t.type = 'sine';
  t.frequency.value = freq; // value in hertz
  t.connect(audioCtx.destination);

  var g = audioCtx.createGain();

  //oscillator.start();
  // var t = new p5.Oscillator();
  // t.setType('sine');
  // t.freq(freq);

  this.start = function () {
    //console.log("PLAY NOTE");
    t.start();
  }

  this.stop = function () {
    console.log("STOP NOTE");
    t.stop();
  }

  this.setVolume = function () {
    //console.log("SET VOLUME");
    //t.amp(this.volume);
    g.gain.value = this.volume;

  }

  this.setVolume();
}

Tone.prototype = Object.create(Note.prototype);
Tone.constructor = Tone;