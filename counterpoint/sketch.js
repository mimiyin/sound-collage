/*
Mimi Yin
 */

var scales = [];
var data = [];
var walkers = [];

function getSum(total, num) {
  return total + num;
}

function preload() {
  data = loadStrings('notes.csv');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  calcRatios();
  textAlign(CENTER, CENTER);
}

function calcRatios() {
  var base = data[0];
  var phrygian = scales[3];

  var ratios = {};
  for (var d = 0; d < data.length; d++) {
    var ratio = data[d] / base;
    console.log(d + ': ' + ratio);
    var n = chromatic[d];
    ratios[n] = ratio;
  }
  var x = width/scls.length;
  var w = x/scls.length;
  var h = 10;
  for (var s = 0; s < scls.length; s++) {
    var b = base*ratios[scls[s]];
    var notes = [];
    var scl = modes[s%modes.length];
    for (var sc = 0; sc < scl.length; sc++) {
      var ratio = ratios[scl[sc]];
      var freq = b * ratio;
      var y = (height-h)*(2-ratio);
      notes.push(new Note(freq, x + w/4, y, w/2, h));
    }
    x += w;
    scales.push(new Scale(notes));
  }

  for(var w = 0; w < 3; w ++) {
    var y = height/2; //random(height-400, height+100);//;
    var x = width/scls.length + (w%3*(width/scls.length)/scls.length) + 100; //random(width/scls.length, width*2/scls.length);
    walkers.push(new Walker(w, x, y));
  }
  randomSeed(0);
}

function draw() {
  background(255)

  for (var s = 0; s < scales.length; s++) {
    scales[s].run(walkers);
  }

  for(var w = 0; w < walkers.length; w++) {
    walkers[w].run();
  }
}

var Walker = function(i, x, y) {
  var index = i;
  var pos = createVector(x, y);
  var sz = createVector(50, 50);
  var noff = createVector(random(1000),random(1000));

  function display() {
    strokeWeight(2);
    fill(255, 0, 0);
    noStroke();
    ellipse(pos.x, pos.y, sz.x, sz.y);
    fill(255);
    text(index, pos.x, pos.y);
  }

  function walk() {
    //pos.x += 0.34*(noise(noff.x)-0.5);
    //pos.y += 0.67*(noise(noff.y)-0.5);
    //pos.x = 1*(cos(noff.x));
    pos.y += 3*(sin(noff.y));

    noff.add(0.01,0.01,0);
  }

  this.run = function() {
    display();
    walk();
  }

  this.getPos = function() {
    return pos;
  }

  this.getSize = function() {
    return sz;
  }

  this.getIndex = function() {
    return index;
  }
}