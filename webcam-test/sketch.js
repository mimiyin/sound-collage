let cam;

function setup() {
  createCanvas(1280, 720);
	cam = createCapture(VIDEO);
  cam.size(1280, 720);
  cam.hide();
}

function draw() {
  background(0);
	cam.loadPixels();
  //image(cam, 0, 0);
  for (let i = 0; i < cam.pixels.length; i++) {
    let r = cam.pixels[i];
    //println(b);
  }
	fill(255);
  textSize(18);
  text(frameRate() + ":   " + cam.width, 50, 50);
}
