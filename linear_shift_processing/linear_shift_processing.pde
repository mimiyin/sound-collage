/* midiFreqKeyboardExample<br/>
   is an example of using the Midi2Hz UGen to easily turn keyboard input 
   into the frequency of an Oscil. Simply type on the home row to change 
   the pitch of the tone. 
   <p>
   For more information about Minim and additional features, 
   visit http://code.compartmental.net/minim/
*/

// import everything necessary to make sound.
import ddf.minim.*;
import ddf.minim.ugens.*;

// create all of the variables that will need to be accessed in
// more than one methods (setup(), draw(), stop()).
Minim minim;
AudioOutput out;

Oscil   wave;
Midi2Hz midi;

// Curve describing the balls dropping in
// Curve describing when to noodle versus go straight

// Curve describing how many layers of rhythm
// Linear positive slope - increases probability of adding a layer of rhythm
// Mostly overlapping extremely long sine waves to shift the rhythms slowly

// User's movement sets off horrific screech

boolean playing = false;

let data, scale, areas, ratios;
float mult = 1;
int numOctaves = 3;
float ow = 100;
float stepSize = 0.00001;
float base = 110;

Note[][] keyboard = [][];
let balls = [];

let lifespan = 300;

function preload() {
  data = loadJSON('scales.json');
}

void setup() {
  size(1280, 720);
  frameRate(30);
  scale = data.scales.chromatic;
  areas = data.areas;
  ratios = data.ratios;

  ow = width/numOctaves;
  calcRatios();
}

void draw() {
  background(255);

  for (int o = 0; o < keyboard.length; o++) {
    let octave = keyboard[o];
    for (let n = 0; n < octave.length; n++) {
      let note = keyboard[o][n];
      note.run(balls);
      updateRelativeNotes(n, note);
    }
  }

  // Update multiplier
  int sum = 0;
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

  for (let b = balls.length-1; b >= 0; b--) {
    let ball = balls[b];
    ball.run();
    if(ball.died()) balls.splice(b, 1);
  }
}

// Paramaters are tonic index and tonic note.
void updateRelativeNotes(t, tn) {
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

void calcRatios() {
  // Calculate scale of areas based on total height of window
  int sum = 0;
  for (int s = 0; s < scale.length; s++) {
    sum += areas[s];
  }

  mult = height / sum;

  float x = 0;
  for (let o = 0; o < numOctaves; o++) {
    keyboard[o] = [];
    float y = height;
    for (let s = 0; s < scale.length; s++) {
      let ratio = ratios[s].n / ratios[s].d;
      let freq = base * ratio * pow(2, o);
      let h = areas[s];
      y -= h * mult;
      keyboard[o].push(new Note(freq, x, y, ow, h));
    }
    x += ow;
  }
}


void mouseMoved() {
  if(frameCount%60 == 0) addBalls(1);
}

void addBalls(num) {
  for (let i = 0; i < num; i++) {
    balls.push(new Ball(random(width), random(height), 20, 20, 0, random(-5, 5)));
  }
}