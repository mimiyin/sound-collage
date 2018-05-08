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
let RANGE_RATE = 0.005; // Rate of range change
let numOctaves = 3;
let xshift = 0;
let ow = 100;
let MOD_RATE = 0.00001; // Rate of modulation

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

// Volumes of sound
let BGBEG = 0.5;
let BGMID = 2;
let BGEND = 0.1;
let WHINEVOL = 0.005;

let FR = 25;
let PLAYTIME = 4 * 60 * 1000; // 4 minutes
let PLAYTIME_IN_SECONDS = PLAYTIME / 1000;
let WHINETIME = 5 * 60 * 1000; // 5 minutes
let b = 0;

// Where to start?
let part = -1;
let start = false;

// Keeping track of time elapsed
let timer;

// Get data from camera
let cnv;
let ipcam;
let CW = 1280;
let CH = 360;

let old = [];
let movement = 0;
let ramp = 0;
let CAM_SCALE = 40; // Sensitivity of camera
let CAM_TH = 50; // Sensitivity of camera

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
}

function reset() {
  ow = width / numOctaves;
  if (numOctaves <= 2) {
    xshift_mult = -2;
  }
  else if (numOctaves <= 4) {
    xshift_mult = -1;
  }
  else {
    xshift_mult = 0;
  }
  xshift = xshift_mult * ow;

  // Update keyboard
  for (let o = 0; o < keyboard.length; o++) {
    let octave = keyboard[o];
    for (let n = 0; n < octave.length; n++) {
      let note = keyboard[o][n];
      note.updateX(xshift);
    }
  }
}



function draw() {
  time();
  updateRange();

  //Run keyboard
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
  text("Part: " + part, 20, height - 50);
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
      note.modulate(areas[rn], tn.counter * MOD_RATE);
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
  let t = frameCount * RANGE_RATE;
  numOctaves = (sin((noise(t) * TWO_PI)) * 0.5 + 0.5) * 5;
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
  if (replay || part != 2 || !pmouseX) return;
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
    case '5':
      part = 5;
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
      // Start/stop performance
      start = !start;
      // Set buffer time
      b = start ? millis() : 0;
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

  // Start counting again when we start
  let time = part < 1 ? millis() : millis() - b;
  if (perform) {
    // Don't play background in parts 2 and 3
    if ((part == 2 || part == 3) && bgsound.isPlaying()) bgsound.pause();

    // Start up cafe sound again for the end
    if (part == 4) {
      bgsound.loop();
      // Fade it in over 5 seconds, after 10 seconds
      bgsound.setVolume(BGEND, 5, 10);
      part = 5;
    }
    else if (part == 3) {
      // Do nothing, just fading out sound
    }
    // Replay recorded data until the end
    else if (part == 2) {
      if (replay) {
        //console.log("REPLAY!");
        if (time > rpdata[rp].m + PLAYTIME + WHINETIME) {
          addBalls(rpdata[rp].num);
          rp++;
          if (rp >= rpdata.length - 1) part = 3;
        }
      }
      else if (!ipcam) {
        // Set up video
        ipcam = new Image();
        //ipcam.src = 'http://192.168.1.10/axis-cgi/mjpg/video.cgi?resolution=1280x360&camera=2';
        ipcam.onload = function () {
          let ctx = document.getElementsByTagName('canvas')[0].getContext('2d');
          setInterval(function () {
            ctx.drawImage(ipcam, 0, 0, CW, CH);
            processCamera(ipcam);
          }, 100);
        }
        ipcam.src = 'http://192.168.1.10/axis-cgi/mjpg/video.cgi?resolution=' + CW + 'x' + CH + '&camera=2';
      }
    }
    // Stop the whine and then proceed to part 2
    else if (part == 1 && time > PLAYTIME + WHINETIME) {
      whine.amp(0);
      whine.stop();
      part = 2;
    }
    // Stop cafe noise at the end of part 1
    else if (part == 1 && time > PLAYTIME) {
      bgsound.pause();
    }
    // Start whine at the beginning of 1
    else if (part == 0 && start) {
      // Ramp up bgsound to mid-volume
      bgsound.setVolume(BGMID, PLAYTIME_IN_SECONDS);

      // Set up whine
      whine = new p5.Oscillator();
      whine.setType('sine');
      whine.freq(BASE * pow(2, 6));
      whine.amp(0);
      whine.start();
      whine.amp(WHINEVOL, PLAYTIME_IN_SECONDS);

      // Proceed to beginning
      part = 1;
    }
    else if(part < 0){
      bgsound.loop();
      bgsound.setVolume(BGBEG);
      part = 0;
    }
  }

}