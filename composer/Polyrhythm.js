var Polyrhythm = function (_rhythms, _sounds) {
  var playing = [];
  var sounds = _sounds;
  var rhythms = _rhythms;


  // Generate a lot of beats for each rhythm layer
  // if (n % 2 == 0) this.beats[n] = new Beat(ratio, sounds[n]);
  // else this.beats[n] = null;
  //
  // this.timeline = new Timeline(this.beats, 0, 120);


  // Even distribution , increase divisor
  // Even distribution + random
  // Even distribution + changing random
  // Random distribution
  // Phasing of tempo
  // Phasing of rotation
  // Rotating evenly


  this.getRhythms = function () {
    return rhythms;
  }
  var x = 0;
  var xspeed = 1;
  var xaccel = 0.01;

  this.run = function () {

    x += xspeed;
    //xspeed += xaccel;
    if (x < 0 || x > width) xspeed *= -1;

    for (var r = 0; r < rhythms.length; r++) {
      var rhythm = rhythms[r];
      // if (sounds) {
      //   var duration = rhythm.getNextBeat();
      //   //console.log(duration);
      //   if (duration > 0) {
      //     // Find an available sound file to play
      //     for (var s = 0; s < sounds.length; s++) {
      //       var sound = sounds[s];
      //       if (sound.isPlaying()) continue;
      //       sound.rate((r + 1) / numRhythms);
      //       sound.jump(0, min(duration / FRAMERATE, sound.duration()));
      //       sound.play();
      //       //playing.push(new Sound(1, sound, duration, false));
      //       break;
      //     }
      //   }
      // }
      rhythm.display(r * width / rhythms.length, 150);
      //if(r%2 == 0) {
      //rhythm.updateTempo(rhythm.getTempo() + (xspeed / (r + 1)));
      //if(frameCount%45 == 0) rhythm.rotate(r*0.005);
      //}
    }
    // for(var p = 0; p < playing.length; p++) {
    //   var noteToPlay = playing[p];
    //   //console.log(noteToPlay);
    //   noteToPlay.run(false);
    //   if(noteToPlay.isDead()) { playing.splice(p); }
    // }
    //
    // console.log("NUM", playing.length);
  }
}