import ipcapture.*;
import processing.sound.*;
import java.awt.event.*;
import java.lang.reflect.*;

JSONObject scales;
JSONArray scale, ratios, areas;
float mult = 1;
final int TOTAL_OCTAVES = 5;
int numNotes;
final float BASE = 110;
final float RANGE_RATE = 0.001; // Rate of range change
float numOctaves = 3;
float xshift_mult = 0;
float ow = 100;
final float MOD_RATE = 0.00001; // Rate of modulation
final float NMULT = 0.1; // Modifier on note volume

Note[][] keyboard;
ArrayList<Ball> balls = new ArrayList<Ball>();

// For mouse control
float speed;
float diag;

SoundFile bgsound;
SinOsc whine;

// Volumes of sound
final float FADE_RESOLUTION = 0.001;
final float BGBEG = 0.5;
final float BGMID = 5;
final float BGEND = 0.1;
final float WHINEVOL = 0.005;

final int FR = 60;
final int PLAYTIME = 5 * 60; // 5 minutes, 300 seconds
final int WHINETIME = 30; // 30 seconds

// Where to start?
boolean start = false;
int cue = CUES.WAIT;

// Keeping track of time elapsed
int act = ACTS.WAIT;

// Timers
String timer;
int lastCue = 0;
String [] actTitles = {"WAIT", "ENTER", "LIGHT", "DARK", "END", "RETURN"};
int [] timers = new int [ACTS.LENGTH];

// Get data from camera
IPCapture ipcam;
final int CAM = 1; //1; // Camera number
final int CW = 1280; //720; //1280;
final int CH = 1280; //720; //360;
final int CAM_SCALE = 1; //40; // Sensitivity of camera
final int CAM_TH = 5; //50; // Sensitivity of camera

final String IPCAM_ADDRESS = "http://192.168.1.10/axis-cgi/mjpg/video.cgi?resolution=" + CW + "x" + CH + "&camera=" + CAM;

// Whether or not we're setting camera area
final boolean DEBUG = true;
int cx = 0; //280;
int cy = 0;
int cw = CW; //-(cx*2);
int ch = CH;

// Store data for movement comparison
float[] old = new float[CW*CH];
float movement = 0;

float m_th_mult = 0.001;
float m_th = 1 * m_th_mult;


void setup() {
  size(1280, 720);
  // Change color mode to HSB
  colorMode(HSB, 100);

  // Load scale data
  scales = loadJSONObject("scales.json");
  scale = scales.getJSONObject("scales").getJSONArray("chromatic");
  numNotes = scale.size();
  areas = scales.getJSONArray("areas");
  ratios = scales.getJSONArray("ratios");

  // Create keyboard
  keyboard = new Note[TOTAL_OCTAVES][numNotes];

  // Calculate diag of screen to normalize mouse speed
  diag = sqrt(sq(width) + sq(height));

  // Reset scale landscape
  reset();
  calcRatios();

  // Use same noise and random number series every time
  noiseSeed(0);
  randomSeed(0);

  // Populate timers
  for (int i = 0; i < ACTS.LENGTH; i++) {
    timers[i] = 0;
  }

  // Load sound
  bgsound = new SoundFile(this, "bgsound-short.mp3");
  bgsound.amp(0);

  // Seed old position
  for (int i = 0; i < old.length; i++) {
    old[i] = -1;
  }
}

void draw() { 
  if (!DEBUG) background(0);

  if (act == ACTS.DARK && ipcam != null && ipcam.isAvailable()) {
    ipcam.read();
    if (DEBUG) image(ipcam, 0, 0);
    processCamera(ipcam);
  }

  time();

  // Change tonal landscape
  updateRange();

  //Run keyboard
  for (int o = 0; o < keyboard.length; o++) {
    for (int n = 0; n < numNotes-1; n++) {
      Note note = keyboard[o][n];
      note.run(balls);
      updateRelativeNotes(n, note);
    }
  }

  // Update multiplier
  float sum = 0;
  for (int n = 0; n < 12; n++) {
    Note note = keyboard[0][n];
    sum += note._rh;
  }
  mult = height / sum;

  // Update keyboard
  for (int o = 0; o < keyboard.length; o++) {
    float y = height;
    for (int n = 0; n < numNotes-1; n++) {
      Note note = keyboard[o][n];
      y -= note._rh * mult;
      note.updateY(y);
      if (!DEBUG) note.show();
    }
  }

  // Run the balls
  for (int b = balls.size() - 1; b >= 0; b--) {
    Ball ball = (Ball)balls.get(b);
    ball.run();
    if (ball.died()) balls.remove(b);
  }

  // Cue Status
  if (DEBUG) {
    noFill();
    stroke(100, 100, 100);
    strokeWeight(2);
    rect(cx, cy, cw, ch);
  }
  String actTitle = actTitles[act];
  noStroke();
  fill(100);
  textSize(16);
  textAlign(RIGHT, CENTER);
  text(timer, width-20, height - 20);
  textAlign(LEFT, CENTER);
  text("Act " + act + ": " + actTitle + " FPS: " + int(frameRate), 20, height - 20);
}

void mouseMoved() {
  // Don't create new balls if replaying
  if (act != ACTS.DARK) return;
  speed += dist(pmouseX, pmouseY, mouseX, mouseY) / diag;
  if (speed > 1) {
    addBalls(speed);
    speed = 0;
  }
}

void keyPressed() {
  // Set cue with number keys
  cue = Character.getNumericValue(key);

  // Change motion threshold for creating notes
  switch (keyCode) {
  case UP:
    m_th += m_th_mult;
    break;
  case DOWN:
    m_th -= m_th_mult;
    break;
  }
  // Make it possible to not be able to create new notes
  m_th = constrain(m_th, 0, 1.1);
}

// Set area to analyze
//void mousePressed() {
//  if (!DEBUG) return;
//  cx = mouseX;
//  cy = mouseY;
//  cx = constrain(cx, 0, CW);
//  cy = constrain(cy, 0, CH);
//}

//void mouseReleased() {
//  if (!DEBUG) return;
//  cw = mouseX - cx;
//  ch = mouseY - cy;
//  cw = constrain(cw, 0, CW);
//  ch = constrain(ch, 0, CH);
//  println("Camera Analysis Area: " + cx, cy, cw, ch);
//}