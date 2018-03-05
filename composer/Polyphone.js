var Polyphone = function (_soundscape, _polyrhythm) {
  var soundscape = _soundscape;
  var polyrhythm = _polyrhythm;
  // A set of notes to play
  // Tones or Sounds

  // Each voice has a walker that is walking around a soundscape
  // Each voice is updated
  // Create an array of parts
  // Each part has a walker, pick the type
  // Generate a rhythm for each part.
  // Update the rhythm of the part?
  // Drop and/or create new parts
  var rhythms = polyrhythm.getRhythms();
  var parts = [];
  //var rhythm = new Rhythm(beats, 0, 60);
  for (var r = 0; r < rhythms.length; r++) {
    var rhythm = rhythms[r];
    parts.push(new Part(soundscape, rhythm));
  }

  this.run = function () {
    // Each voice has a walker, a rhythm and a set of durations.
    // Each voice can update its walker in different ways
    // Each voice can update its rhythm in different ways
    // Each voice can update its durations in different ways
    polyrhythm.run();
    for (var p = 0; p < parts.length; p++) {
      var part = parts[p];
      var currentNotes = part.run();
      soundscape.run(currentNotes);
    }

    for (var p = 0; p < parts.length; p++) {
      var part = parts[p];
      part.display();
    }
  }
}

var Part = function (_soundscape, _rhythm) {
  var soundscape = _soundscape;
  var rhythm = _rhythm;
  var walker = new Walker();
  var cni = -1;
  var current = [];
  var startIndex = 0;

  this.display = function () {
    walker.display();
  }
  var nn = 0;
  var dn = 0;
  var done = {};

  this.run = function () {

    var cn;
    // See if it's time for the next beat
    var duration = rhythm.getNextBeat();
    // If there is a beat, walk
    if (duration) {
      walker.walk();
      // Pick a new note: Where is the walker now?
      cn = soundscape.getNote(walker);
      cni = cn.index;
    }
    else if (duration == 0) {
      cni = -1;
    }


    //return {};

    // Create new notes
    if (duration && cn) {
      if (cni in current) current[cni].addDuration(duration);
      else {
        // for (var ss = startIndex; ss < sounds.length + startIndex; ss++) {
        //   var s = ss%sounds.length;
        //   var sound = sounds[s];
        //   console.log("SOUND", s, sound.isPlaying());
        //
        //   // For percussive sound
        //   // You want to play sound, not loop it.
        //   // And you want to create a new sound no matter what instead of adding
        //   if (!sound.isPlaying() && !(cn.index in cn)) {
        //     current[cn.index] = new Sound(ratios[cn.index].ratio, sound, duration, true);
        //     startIndex++;
        //     break;
        //   }
        // }
        nn++;
        current[cni] = new Tone(220, ratios[cni].ratio, duration, false);
        current[cni].start();
      }
    }
    // Go through all the current notes
    for (var c in current) {
      var note = current[c];
      note.run(cni == c);
      if (note.isDead()) {
        //console.log("DEAD!", c);
        dn++;
        note.stop();
        done[c] = current[c];
        delete current[c];
        //setTimeout(function(){   delete current[c]; }, 1000);
      }
    }

    console.log("NEW", nn, "DEAD", dn);
    return current;
  }
}

// Differen types of walkers
// Mouse walker
// Random walker
// Noisy walker
// Bouncing ball walker
var Walker = function () {
  this.noff = random(100, 1000);
  this.x = 2 * width / 3 + randomGaussian() * 10;
  this.y = height / 2;
  this.w = 10;
  this.h = this.w;

  this.walk = function () {
    //if(frameCount%FRAMERATE == 0) this.x = random(width);
    //this.x += (mouseX-this.x)*random(0.1);
    //this.x += (noise((frameCount + this.noff) * 0.01) - 0.5) * 10;
    this.x = random(width); //mouseX;
    this.y += (noise((100 + frameCount + this.noff) * 0.01) - 0.5) * 2;

  }
  this.display = function () {
    noStroke();
    fill(255, 0, 0);
    ellipse(this.x, this.y, this.w, this.h);
  }
}