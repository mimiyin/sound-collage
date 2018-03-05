// Curve describing the balls dropping in
// Curve describing when to noodle versus go straight

// Curve describing how many layers of rhythm
// Linear positive slope - increases probability of adding a layer of rhythm
// Mostly overlapping extremely long sine waves to shift the rhythms slowly

// User's movement sets off horrific screech

let playing = false;
let numNotes = 0;
let notes = [];
let scl = 1;
let data = [];

let balls = [];

function preload() {
  data = loadStrings('notes.csv');
}

function addBalls(num) {
  for (let i = 0; i < num; i++) {
    balls.push(new Ball(width / 2, height/2, 20, 20, 0, random(-5, 5)));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  calcRatios();
  balls.push(new Ball(width / 2, height/2, 20, 20, 0, random(-5, 5)));

  setInterval(function () {
    if(random(1) < 0.01) addBalls(random(2));
  }, 1000);
}

function draw() {
  background(255);

  for (var n = 0; n < notes.length; n++) {
    for (var m = 0; m < numNotes; m++) {
      notes[n][m].run(balls);
    }
  }

  for (let b = 0; b < balls.length; b++) {
    let ball = balls[b];
    ball.run();
  }
}

function recalcRatios() {
  var baseIndex = 3;
  var base;

  data.reverse();
  base = data[baseIndex] * pow(2, 2);

  // Ratios of the Western scales
  var sel = {
    3: 2,
    5: .34,
    7: 1,
    8: .67,
    10: 1.5,
    12: .5,
    14: .25,
    15: 2
  };

  let sum = 0;
  for (var s in sel) {
    sum += sel[s];
  }
  scl = height / sum;

  let ratios = {};
  for (var s in sel) {
    var r = data[s] / data[baseIndex];
    ratios[s] = r;
    numNotes++;
  }

  let ow = 100;
  let x = width / 2 - ow / 2;
  let numOctaves = 1;
  let mults = [][];
  for (var n = 0; n < notes.length; n++) {
    for (var m = 0; m < numNotes; m++) {
      mults[n][m] = notes[n][m].counter/60000;
    }
  }
  for (var n = 0; n < notes.length; n++) {
    for (var m = 0; m < numNotes; m++) {
      let mult = notes[n][m].counter/60000;
      var diff = sel[s]; //ratio-pratio;
      var h = diff * scl;
      y -= h;
      notes[n][m].update(y, h)
    }
  }

  for (var o = 0; o < numOctaves; o++) {
    notes[o] = [];
    var y = height;
    for (var s in sel) {
      var ratio = ratios[s];
      var freq = base * pow(2, 3) * ratio;
      var diff = sel[s]; //ratio-pratio;
      var h = diff * scl;
      y -= h;
      notes[o].push(new Note(freq, x, y, ow, h));
    }
    x += ow;
  }
}

function calcRatios() {
  var baseIndex = 3;
  var base;

  data.reverse();
  base = data[baseIndex] * pow(2, 2);

  // Ratios of the Western scales
  var sel = {
    3: 2,
    5: .34,
    7: 1,
    8: .67,
    10: 1.5,
    12: .5,
    14: .25,
    15: 2
  };

  let sum = 0;
  for (var s in sel) {
    sum += sel[s];
  }
  scl = height / sum;

  let ratios = {};
  for (var s in sel) {
    var r = data[s] / data[baseIndex];
    ratios[s] = r;
    numNotes++;
  }

  let ow = 100;
  let x = width / 2 - ow / 2;
  let numOctaves = 1;
  for (var o = 0; o < numOctaves; o++) {
    notes[o] = [];
    var y = height;
    for (var s in sel) {
      var ratio = ratios[s];
      var freq = base * pow(2, 3) * ratio;
      var diff = sel[s]; //ratio-pratio;
      var h = diff * scl;
      y -= h;
      notes[o].push(new Note(freq, x, y, ow, h));
    }
    x += ow;
  }
}