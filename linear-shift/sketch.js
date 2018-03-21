// Curve describing the balls dropping in
// Curve describing when to noodle versus go straight

// Curve describing how many layers of rhythm
// Linear positive slope - increases probability of adding a layer of rhythm
// Mostly overlapping extremely long sine waves to shift the rhythms slowly

// User's movement sets off horrific screech

let playing = false;

let data, scale, areas, ratios;
let mult = 1;
let TOTAL_OCTAVES = 5;
let BASE = 110;
let numOctaves = 3;
let ow = 100;
let stepSize = 0.00001;

let keyboard = [];
let balls = [];

let speed = 0;
let diag = 0;

let replay = false;
let record = false;
let rpdata;
let rp = 0;

let bgsound;
let timer;

let PLAYTIME = 3*60*1000;

let whine;

function preload() {
  bgsound = loadSound('bgsound.mp3');
  data = loadJSON('scales.json');
  rpdata = loadJSON('replay3.json');
}

function setup() {
  bgsound.play();
  bgsound.setVolume(0.1);
  createCanvas(567, 516);
  frameRate(30);
  scale = data.scales.chromatic;
  areas = data.areas;
  ratios = data.ratios;
  diag = sqrt(sq(width) + sq(height));

  reset();
  calcRatios();

  noiseSeed(0);
  randomSeed(0);

  colorMode(HSB, 100);

  timer = createP();
  timer.attribute('id', 'timer');

  whine = new p5.Oscillator();
  whine.setType('sine');
  whine.freq(BASE*pow(2, 6));
  whine.amp(0);
  whine.start();
  whine.amp(0.1, PLAYTIME/1000);
}

function reset() {
  ow = width / numOctaves;
}

function draw() {
  background(0);

  // Print the time elapsed
  let s = nfs(millis()/1000, 2, 0);
  let minute = floor(s/60);
  let seconds = s%60;
  timer.html(minute + ":" + seconds);

  // Turn off background sound
  if(millis() > PLAYTIME && !replay && !record) {
    bgsound.pause();
    replay = true;
  }
  else if(millis() > PLAYTIME + 3000) {
    whine.amp(0);
    whine.stop();
  }

  if (replay && rpdata[rp]) {
    if (millis() > rpdata[rp].m + PLAYTIME + 3000) {
      addBalls(rpdata[rp].num);
      rp++;
    }
  }

  // // Change the range with a noisy walker
  // let pNumOctaves = numOctaves;
  // numOctaves += (noise(frameCount * 0.01) - 0.5)*2;
  // if (frameCount % 60 == 0) {
  //   console.log(frameRate(), numOctaves);
  // }
  // numOctaves = round(numOctaves);
  // numOctaves = constrain(numOctaves, 1, TOTAL_OCTAVES);
  // if (pNumOctaves != numOctaves) reset();


  for (let o = 0; o < keyboard.length; o++) {
    let octave = keyboard[o];
    for (let n = 0; n < octave.length; n++) {
      let note = keyboard[o][n];
      note.run(balls);
      updateRelativeNotes(n, note);
    }
  }

  // Update multiplier
  let sum = 0;
  let octave = keyboard[0];
  for (let n = 0; n < octave.length; n++) {
    let note = octave[n];
    sum += note._rh;
  }
  mult = height / sum;

  // Update keyboard
  for (let o = 0; o < keyboard.length; o++) {
    let octave = keyboard[o];
    let y = height;
    for (let n = 0; n < octave.length; n++) {
      let note = keyboard[o][n];
      y -= note._rh * mult;
      note.update(y);
    }
  }

  for (let b = balls.length - 1; b >= 0; b--) {
    let ball = balls[b];
    ball.run();
    if (ball.died()) balls.splice(b, 1);
  }
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
      let freq = BASE * ratio * pow(2, o);
      let h = areas[s];
      y -= h * mult;
      keyboard[o].push(new Note(freq, o, y, h));
    }
  }
}

function mouseMoved() {
  // Don't create new balls if replaying
  if (replay || !record) return;
  speed += dist(pmouseX, pmouseY, mouseX, mouseY) / diag;
  if (speed > 1) {
    addBalls(speed);
    speed = 0;
  }
}

let json = [];
function addBalls(num) {
  if (!replay) json.push({
    m: millis(),
    num: num
  });
  for (let i = 0; i < num; i++) {
    balls.push(new Ball(random(width), random(height), 20, 20, 0, random(-5, 5), 300 * num));
  }
}

function mousePressed() {
  saveJSON(json, "replay.json");
}