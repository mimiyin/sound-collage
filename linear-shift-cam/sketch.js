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

let recording = true;
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
let timer;

let PLAYTIME = 4 * 60 * 1000;
let WHINETIME = 5000;

let whine;

// Get data from camera
let webcam;
let kinectron;
let old = [];
let movement = 0;
let ramp = 0;
let CAM_SCALE = 40;
let CAM_TH = 50;



function preload() {
  bgsound = loadSound('bgsound-short.mp3');
  scales = loadJSON('scales.json');
  record = loadJSON('record.json');
}

function setup() {
  if (recording) {
    createCanvas(windowWidth, windowHeight);
    frameRate(25);
    // Record setup
    recordJSON.setup.w = width;
    recordJSON.setup.h = height;
    recordJSON.setup.fr = frameRate();
  }
  else {
    let setup = record.setup;
    createCanvas(setup.w, setup.w);
    frameRate(setup.fr);
  }


  scale = scales.scales.chromatic;
  areas = scales.areas;
  ratios = scales.ratios;

  rpdata = record.data;

  diag = sqrt(sq(width) + sq(height));

  reset();
  calcRatios();

  noiseSeed(0);
  randomSeed(0);

  colorMode(HSB, 100);

  // Set up timer
  timer = createP();
  timer.attribute('id', 'timer');

  // Set up background sound
  bgsound.loop();
  bgsound.setVolume(.5);

  // Set up whine
  whine = new p5.Oscillator();
  whine.setType('sine');
  whine.freq(BASE * pow(2, 6));
  whine.amp(0);
  whine.start();
  whine.amp(0.005, PLAYTIME / 1000);

  // Set up video
  //webcam = createCapture(VIDEO);
  // Define and create an instance of kinectron
  //kinectron = new Kinectron("172.16.231.112");
  kinectron = new Kinectron("192.168.0.117");

  // Connect with application over peer
  kinectron.makeConnection();

  // Request all tracked bodies and pass data to your callback
  kinectron.startInfrared( function(el) {
    loadImage(el.src, processCamera);
  });
}

function reset() {
  ow = width / numOctaves;
}



function draw() {
  background(0);

  // Use webcam
  //processCamera(webcam);

  // time();
  // updateRange();

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
  numOctaves += (noise(frameCount * 0.01) - 0.5)*2;
  if (frameCount % 60 == 0) {
    console.log(frameRate(), numOctaves);
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
  if (replay || !recording || !pmouseX) return;
  speed += dist(pmouseX, pmouseY, mouseX, mouseY) / diag;
  if (speed > 1) {
    addBalls(speed);
    speed = 0;
  }
}

function mousePressed() {
  saveJSON(recordJSON, "record.json");
}

function processCamera(img) {
  // Detect motion from camera
  img.loadPixels();
  let data = img.pixels;
  for (let x = 0; x < img.width; x+=CAM_SCALE) {
    for (let y = 0; y < img.height; y+=CAM_SCALE) {

      let pos = (x + y * img.width) * 4;
      let r = data[pos];
      let g = data[pos+1];
      let b = data[pos+2];
      let br = brightness(color(r,g,b));

      if(old[pos] && abs(old[pos] - br) > CAM_TH) {
        movement += 0.01;
      }
      old[pos] = br; //{ red: r, green: g, blue: b};
    }
  }
  if (movement > 1) {
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

  // Turn off background sound
  if (!recording) {
    if (replay) {
      //console.log("REPLAY!");
      if (millis() > rpdata[rp].m + PLAYTIME) {
        addBalls(rpdata[rp].num);
        rp++;
        if (rp >= rpdata.length - 1) replay = false;
      }
    }
    else {
      //console.log("BOOKENDS");
      if (millis() > 11 * 60 * 1000 && rp >= rpdata.length - 1 && !bgsound.isPlaying()) {
        bgsound.loop();
        // Fade it in over 5 seconds, after 10 seconds
        bgsound.setVolume(1, 5, 10);
      }
      else if (rp < 1 && millis() > PLAYTIME + WHINETIME) {
        whine.amp(0);
        whine.stop();
        replay = true;
      }
      else if (rp < 1 && millis() > PLAYTIME) {
        bgsound.pause();
      }
    }
  }
  else {
    bgsound.pause();
  }
}