// Curve describing the balls dropping in
// Curve describing when to noodle versus go straight

// Curve describing how many layers of rhythm
// Linear positive slope - increases probability of adding a layer of rhythm
// Mostly overlapping extremely long sine waves to shift the rhythms slowly

// User's movement sets off horrific screech

let playing = false;

let scales, scale, areas, ratios;
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

// Recording data?
let recording = false;
// Performing?
let perform = true;
// Replaying recorded data?
let replay = false;

let record;
let rpdata;
let rp = 0;
let recordJSON = {
  setup: {
    w: undefined,
    h: undefined,
    fr: undefined
  },
  data: [],
};

let bgsound;
let whine;

let BGBEG = 0.1;
let BGMID = 2;
let BGEND = 1;
let WHINEVOL = 0.005;

let FR = 25;
let PLAYTIME = 4 * 60 * 1000; // 4 minutes
let WHINETIME = 5 * 60 * 1000; // 5 minutes
let MAX_END_TIME = 15 * FR * 1000;
let buffer = 0;
let b = 0;
let start = false;

// Where to start?
let part;

// Keeping track of time elapsed
let timer;

// Get data from camera
let cnv;
let webcam;
let CW = 1280;
let CH = 360;

let old = [];
let movement = 0;
let ramp = 0;
let CAM_SCALE = 40;
let CAM_TH = 50;

let m_th = 1;


function preload() {
  bgsound = loadSound('bgsound-short.mp3');
  scales = loadJSON('scales.json');
  if (replay) record = loadJSON('record.json');
}

function setup() {
  if (replay) {
    let setup = record.setup;
    cnv = createCanvas(setup.w, setup.w);
    frameRate(setup.fr);
    rpdata = record.data;
  }
  else {
    cvn = createCanvas(windowWidth, windowHeight);
    if (recording) {
      frameRate(FR);
      // Record setup
      recordJSON.setup.w = width;
      recordJSON.setup.h = height;
      recordJSON.setup.fr = FR;
    }
  }


  scale = scales.scales.chromatic;
  areas = scales.areas;
  ratios = scales.ratios;

  diag = sqrt(sq(width) + sq(height));

  reset();
  calcRatios();

  noiseSeed(0);
  randomSeed(0);

  colorMode(HSB, 100);

  // Set up timer
  timer = createP();
  timer.attribute('id', 'timer');

  if (perform) {
    // Set up background sound
    bgsound.loop();
    bgsound.setVolume(BGBEG);
  }
}

function reset() {
  ow = width / numOctaves;
}



function draw() {
  time();
  //updateRange();

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

  // Run the balls
  for (let b = balls.length - 1; b >= 0; b--) {
    let ball = balls[b];
    ball.run();
    if (ball.died()) balls.splice(b, 1);
  }

  // Print out which part
  fill(255);
  noStroke();
  text("Part: " + part + "\tStart: " + start, 20, height - 50);
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

function updateRange() {
  // Change the range with a noisy walker
  let pNumOctaves = numOctaves;
  let t = frameCount * 0.001;
  numOctaves = sin((noise(t) * t)) * 5;
  if (frameCount % FR == 0) {
    console.log("num octaves: " + nfs(numOctaves, 0, 2));
  }
  numOctaves = round(numOctaves);
  numOctaves = constrain(numOctaves, 1, TOTAL_OCTAVES);
  if (pNumOctaves != numOctaves) reset();
}

function addBalls(num) {
  if (recording) recordJSON.data.push({
    m: millis(),
    num: num
  });
  for (let i = 0; i < num; i++) {
    balls.push(new Ball(random(width), random(height), 20, 20, 0, random(-5, 5), 300 * num));
  }
}

function mouseMoved() {
  // Don't create new balls if replaying
  if (replay || part != 1 || !pmouseX) return;
  speed += dist(pmouseX, pmouseY, mouseX, mouseY) / diag;
  if (speed > 1) {
    addBalls(speed);
    speed = 0;
  }
}

// Press a key to save the data
function keyPressed() {
  switch (key) {
    case 's':
      saveJSON(recordJSON, "record.json");
      break;
    case '0':
      part = 0;
      break;
    case '1':
      part = 1;
      break;
    case '2':
      part = 2;
      break;
    case '3':
      part = 3;
      break;
    case '4':
      part = 4;
      break;
  }

  // Change motion threshold for creating notes
  switch (keyCode) {
    case RIGHT_ARROW:
      m_th += 0.1;
      break;
    case LEFT_ARROW:
      m_th -= 0.1;
      break;
    case ENTER:
      start = !start;
      break;
  }
}

function processCamera() {
  if (part != 1) return;
  // Detect motion from camera
  loadPixels();
  let data = pixels;
  for (let x = 0; x < CW; x += CAM_SCALE) {
    for (let y = 0; y < CH; y += CAM_SCALE) {
      let pos = (x + y * width) * 4;
      let r = data[pos];
      let g = data[pos + 1];
      let b = data[pos + 2];
      let br = brightness(color(r, g, b));

      if (old[pos] && abs(old[pos] - br) > CAM_TH) {
        movement += 0.01;
      }
      old[pos] = br; //{ red: r, green: g, blue: b};
    }
  }
  console.log("m: " + nfs(movement, 0, 2) + "\tm_th: " + nfs(m_th, 0, 2));
  // If we're in part 1
  if (movement > m_th) {
    addBalls(movement);
    movement = 0;
  }
}

function time() {
  // Display the time elapsed in mm:ss;
  let seconds = millis() / 1000;
  let minute = floor(seconds / 60);
  seconds = seconds % 60;
  timer.html(nfs(minute, 2, 0) + ":" + nfs(int(seconds), 2, 0));

  let time = millis();
  if (perform) {
    // Update the buffer if performing
    buffer = PLAYTIME + WHINETIME + b;

    // Start up cafe sound again for part 2
    if (part == 3) {
      bgsound.loop();
      // Fade it in over 5 seconds, after 10 seconds
      bgsound.setVolume(BGEND, 5, 10);
      part = 4;
    }
    // Automatically proceed to part 2 after 15 minutes
    else if (time > MAX_END_TIME) {
      part = 2;
    }
    // Stop the whine and then proceed to part 1
    else if (part == 0 && time > buffer) {
      whine.amp(0);
      whine.stop();
      part = 1;
    }
    // Stop cafe noise
    else if (part == 0 && time > PLAYTIME + b) {
      bgsound.pause();
    }
    else if (part == undefined && start) {
      bgsound.setVolume(BGMID, (PLAYTIME + b) / 1000);

      // Set up whine
      whine = new p5.Oscillator();
      whine.setType('sine');
      whine.freq(BASE * pow(2, 6));
      whine.amp(0);
      whine.start();
      whine.amp(WHINEVOL, (PLAYTIME + b) / 1000);

      // Begin
      part = 0;

      // Set buffer time
      b = time;
    }
  }

  // Don't play background in parts 1 and 2
  if ((part == 1 || part == 2) && bgsound.isPlaying()) bgsound.pause();

  // Replay recorded data until the end
  if (part == 1) {
    if (replay) {
      //console.log("REPLAY!");
      if (time > rpdata[rp].m + buffer) {
        addBalls(rpdata[rp].num);
        rp++;
        if (rp >= rpdata.length - 1) part = 2;
      }
    }
    else if (!webcam) {
      // Set up video
      webcam = new Image();
      //webcam.src = 'http://192.168.1.10/axis-cgi/mjpg/video.cgi?resolution=1280x360&camera=2';
      webcam.onload = function () {
        let ctx = document.getElementsByTagName('canvas')[0].getContext('2d');
        setInterval(function () {
          ctx.drawImage(webcam, 0, 0, CW, CH);
          processCamera(webcam);
        }, 100);
      }
      webcam.src = 'http://192.168.1.10/axis-cgi/mjpg/video.cgi?resolution=' + CW + 'x' + CH + '&camera=2';
    }
  }
}