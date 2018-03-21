// Curve describing the balls dropping in
// Curve describing when to noodle versus go straight

// Curve describing how many layers of rhythm
// Linear positive slope - increases probability of adding a layer of rhythm
// Mostly overlapping extremely long sine waves to shift the rhythms slowly

// User's movement sets off horrific screech

let playing = false;

let data, scale, areas, ratios;
let mult = 1;
let TOTAL_OCTAVES = 3;
let numOctaves = 3;
let ow = 100;
let base = 27.5;
let stepSize = 0.00001;

let keyboard = [];
let balls = [];

let speed = 0;
let diag = 0;

let replay = false;
let rpdata;
let rp = 0;

function preload() {
  data = loadJSON('scales.json');
  if (replay) rpdata = loadJSON('replay.json');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  scale = data.scales.chromatic;
  areas = data.areas;
  ratios = data.ratios;
  diag = sqrt(sq(width) + sq(height));
  //reset();
  //calcRatios();

  noiseSeed(1);
  randomSeed(0);

}

function reset() {
  ow = width / numOctaves;
}

function draw() {
  background(255);
  // if (replay && rpdata[rp]) {
  //   if (millis() > rpdata[rp].m) {
  //     addBalls(rpdata[rp].num);
  //     rp++;
  //   }
  // }

  if (frameCount % 60 == 0) console.log(frameRate());
}

// Paramaters are tonic index and tonic note.
function updateRelativeNotes(t, tn) {
  if (tn.counter <= 0) return;
  // Iterate through ALL the keyboard again for each note.
  for (let o = 0; o < keyboard.length; o++) {
    let octave = keyboard[o];
    for (let n = 0; n < octave.length; n++) {
      let note = keyboard[o][n];
      // Calculate the relative note
      let rn = n >= t ? n - t : (n + (octave.length - 1)) - t;
      let h = (areas[rn] - note.h);
      note.modulate(areas[rn], tn.counter * stepSize);
    }
  }
}

function calcRatios() {
  // Calculate scale of areas based on total height of window
  let sum = 0;
  for (let s = 0; s < scale.length; s++) {
    sum += areas[s];
  }

  mult = height / sum;

  for (let o = 0; o < TOTAL_OCTAVES; o++) {
    keyboard[o] = [];
    let y = height;
    for (let s = 0; s < scale.length; s++) {
      let ratio = ratios[s].n / ratios[s].d;
      let freq = base * ratio * pow(2, o);
      let h = areas[s];
      y -= h * mult;
      keyboard[o].push(new Note(freq, o, y, h));
    }
  }
}

function mouseMoved() {
  // Don't create new balls if replaying
  if (replay) return;
  speed += dist(pmouseX, pmouseY, mouseX, mouseY) / diag;
  if (speed > 1) {
    addBalls(speed);
    speed = 0;
  }
}

let json = [];

function addBalls(num) {
  // if (!replay) json.push({
  //   m: millis(),
  //   num: num
  // });
  for (let i = 0; i < num; i++) {
    balls.push(new Ball(random(width), random(height), 20, 20, 0, random(-5, 5), 300 * num));
  }
}

function mousePressed() {
  saveJSON(json, "replay.json");
}