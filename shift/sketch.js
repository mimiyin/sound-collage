/*
Mimi Yin
 */

let scales = {};
let ratios = [];
let sounds = [];

let line;
let walkers = [];

let audioCtx = new(window.AudioContext || window.webkitAudioContext)();

function getSum(total, num) {
  return total + num;
}

function preload() {
  //data = loadStrings('notes.csv', createScales);
  loadJSON('scales.json', createScales);
  for (let i = 0; i < 16; i++) {
    sounds.push(loadSound('bassDrone.wav'));
  }
}

function createScales(data) {
  // Numerators and Denomenators for 12 tones
  for (let r = 0; r < data.ratios.length; r++) {
    let nd = data.ratios[r];
    let ratio = nd.n / nd.d;
    let dissonance = nd.n * nd.d;
    let consonance = 1 / dissonance;
    ratios.push({
      ratio: ratio,
      random: random(1),
      dissonance: dissonance,
      consonance: consonance,
    });
  }
  scales = data.scales;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(FRAMERATE);
  textAlign(CENTER, CENTER);
  line = new Line('chromatic', 440, "consonance", 0, 0, width, height);

}


function draw() {
  background(255);
  for(let w = 0; w < walkers.length; w++) {
    walkers[w].run();
    line.run(walkers[w]);
  }

  line.display();

}

function mousePressed() {
  walkers.push(new Walker(mouseX, mouseY));
}