/**
 *  @name delay
 *  @description delay gives depth and perceived space to a sound. Here,
 *  noise is processed with delay.
 *
 * <p><em><span class="small"> To run this example locally, you will need the
 * <a href="http://p5js.org/reference/#/libraries/p5.sound">p5.sound library</a>
 * a sound file, and a running <a href="https://github.com/processing/p5.js/wiki/Local-server">local server</a>.</span></em></p>
 */
let sound, delay;
let ball;


function setup() {
  createCanvas(710, 200);
  background(255);

  // Create an Audio input
  input = new p5.AudioIn();

  input.start();
}

function preload() {
  //soundFormats('mp3', 'ogg');
  soundFile = loadSound('clock.mp3');

  // disconnect the default connection
  // so that we only hear the sound via the delay.process
  soundFile.disconnect();
}

function setup() {
  createCanvas(innerWidth,100);
  background(0);
  soundFile.loop();

  delay = new p5.Delay();

  // connects soundFile to delay with a
  // delayTime of 6 seconds, decayRate of 0.2%


  delay.amp(4); // turn it up!

  ball = new Ball(0, height/2, 50, 50, 5, 0);
}

function draw() {
  background(0);
  ball.run();
  let dt = constrain(ball.x/width, 0, 0.99);
  //if(frameCount % 30 == 0)
  // source, delayTime, feedback, filter frequency
  delay.process(soundFile, dt, 0.5, 2000);

}

function mousePressed() {
  soundFile.play();
}
