/*
Mimi Yin
 */

var scales = {};
var ratios = [];
var sounds = [];

var audioCtx = new(window.AudioContext || window.webkitAudioContext)();

function getSum(total, num) {
  return total + num;
}

function preload() {
  //data = loadStrings('notes.csv', createScales);
  loadJSON('scales.json', createScales);
  for (var i = 0; i < 16; i++) {
    sounds.push(loadSound('bassDrone.wav'));
  }
}

function createScales(data) {
  // Numerators and Denomenators for 12 tones
  for (var r = 0; r < data.ratios.length; r++) {
    var nd = data.ratios[r];
    var ratio = nd.n / nd.d;
    var dissonance = nd.n * nd.d;
    var consonance = 1 / dissonance;
    ratios.push({
      ratio: ratio,
      random: random(1),
      dissonance: dissonance,
      consonance: consonance,
    });
  }
  scales = data.scales;
}


var pp;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(FRAMERATE);
  textAlign(CENTER, CENTER);
  var scale = new Line('minor', 440, "dissonance", 0, 0, width, height);

  var numRhythms = 3;
  var numBeats = 12;
  var rhythms = [];
  for (var r = 0; r < numRhythms; r++) {
    var beats = [];
    for (var b = 0; b < numBeats + r; b++) {
      if (b % (r+2) == 0) {
        beats.push(50);
        //beats.push((b*r*10)+10);
      }
      else beats.push(0);
    }
    rhythms.push(new Rhythm(beats, 0, 60));
  }

  var polyrhythm = new Polyrhythm(rhythms, sounds);
  pp = new Polyphone(scale, polyrhythm);
}


var nns = [];
function draw() {
  background(255)
  // if(frameCount%15 == 0) {
  //   var nn = new Tone(220, frameCount*0.01, 50, false);
  //   nn.start();
  //   nns.push(nn);
  // }
  //
  // if(nns.length > 3) {
  //   nns[0].stop();
  //   nns.splice(0);
  // }
  pp.run();
}