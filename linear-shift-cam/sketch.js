// open -a Google\ Chrome --args --disable-web-security --user-data-dir
function preload() {
  bgsound = loadSound('bgsound-short.mp3');
  scales = loadJSON('scales.json');
  if (REPLAY) record = loadJSON('record.json');
}

function setup() {
  if (REPLAY) {
    let setup = record.setup;
    cnv = createCanvas(setup.w, setup.w);
    frameRate(setup.fr);
    rpdata = record.data;
  } else {
    cvn = createCanvas(windowWidth, windowHeight);
    if (RECORD) {
      frameRate(FR);
      // Record setup
      recordJSON.setup.w = width;
      recordJSON.setup.h = height;
      recordJSON.setup.fr = FR;
    }
  }

  // Load scale data
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
  } else if (numOctaves <= 4) {
    xshift_mult = -1;
  } else {
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

  // Print out which cue we're on
  noStroke();
  fill(0);
  rect(0, height - 100, width, 100);
  fill(255);
  text("Act: " + act + "\tFPS: " + nfs(frameRate(), 0, 2), 20, height - 50);
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
    //console.log("num octaves: " + nfs(numOctaves, 0, 2));
  }
  numOctaves = round(numOctaves);
  numOctaves = constrain(numOctaves, 1, TOTAL_OCTAVES);
  if (pNumOctaves != numOctaves) reset();
}

function addBalls(num) {
  num = map(num, m_th, m_th*2, 1, 10);
  if (RECORD) recordJSON.data.push({
    m: millis(),
    num: num
  });
  for (let i = 0; i < num; i++) {
    balls.push(new Ball(random(width), random(height), 20, 20, 0, random(-5, 5), 300 * num));
  }
}

function mouseMoved() {
  // Don't create new balls if replaying
  if (REPLAY || act != ACTS.DARK || !pmouseX) return;
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
      cue = 0;
      break;
    case '1':
      cue = 1;
      break;
    case '2':
      cue = 2;
      break;
    case '3':
      cue = 3;
      break;
    case '4':
      cue = 4;
      break;
    case '5':
      cue = 5;
      break;
    case '6':
      cue = 6;
      break;
  }

  // Change motion threshold for creating notes
  switch (keyCode) {
    case RIGHT_ARROW:
      m_th += CW*CH*0.1;
      break;
    case LEFT_ARROW:
      m_th -= CW*CH*0.1;
      break;
  }

  m_th = constrain(m_th, CW*CH*0.1, CW*CH);
}

function processCamera() {
  if (act != ACTS.DARK) return;
  // Detect motion from camera
  loadPixels();
  let data = pixels;
  for (let x = 0; x < CW; x += CAM_SCALE) {
    for (let y = 0; y < CH; y += CAM_SCALE) {
      let pos = (x + y * width) * 4;
      let r = data[pos];

      if (old[pos] && abs(old[pos] - r) > CAM_TH) {
        movement++;
      }
      old[pos] = r; //{ red: r, green: g, blue: b};
    }
  }
  //if(frameCount%30 == 0)
  console.log("m: " + nfs(movement, 0, 3) + "\tm_th: " + nfs(m_th, 0, 2));
  // If we're in act 1
  if (movement > m_th) {
    console.log("ADD BALLS");
    addBalls(movement);
    movement = 0;
  }
}

function msToMMSS(ms) {
  // Display the time elapsed in mm:ss;
  let seconds = ms / 1000;
  let minute = floor(seconds / 60);
  seconds = seconds % 60;
  return nfs(minute, 2, 0) + ":" + nfs(int(seconds), 2, 0);
}

function time() {

  // Update current timer
  timers[act] = msToMMSS(millis() - lastCue);
  console.log();
  // Display timers
  timer.html(
    "ENTER: " + timers[ACTS.ENTER] +
    "\tLIGHT: " + timers[ACTS.LIGHT] +
    "\tDARK: " + timers[ACTS.DARK] +
    "\tEND: " + timers[ACTS.END] +
    "\tRETURN: " + timers[ACTS.RETURN] +
    "\tTOTAL: " + msToMMSS(millis()));

  // Start up cafe sound again for the end
  if (cue == CUES.RETURN) {
    // Log time
    act = ACTS.RETURN;
    lastCue = millis();

    bgsound.loop();
    // Fade it in over 5 seconds, after 10 seconds
    bgsound.setVolume(BGEND, 5, 10);
    cue = 0;
  } else if (cue == CUES.STOPDARK) {
    // Log time
    act = ACTS.END;
    lastCue = millis();

    // Do nothing, just fading out sound
  }
  // REPLAY recorded data until the end
  else if (cue == CUES.STARTDARK) {
    if (REPLAY) {
      //console.log("REPLAY!");
      if (time > rpdata[rp].m + PLAYTIME + WHINETIME) {
        addBalls(rpdata[rp].num);
        rp++;
        if (rp >= rpdata.length - 1) part = 3;
      }
    } else if (!ipcam) {
      // Set up video
      ipcam = new Image();
      //ipcam.src = 'http://192.168.1.10/axis-cgi/mjpg/video.cgi?resolution=1280x360&camera=2';
      ipcam.onload = function() {
        console.log("GOT FEED!");
        let ctx = document.getElementsByTagName('canvas')[0].getContext('2d');
        setInterval(function() {
          ctx.drawImage(ipcam, 0, 0, CW, CH);
          processCamera(ipcam);
        }, 100);
      }
      ipcam.src = 'http://192.168.1.10/axis-cgi/mjpg/video.cgi?resolution=' + CW + 'x' + CH + '&camera=' + CAM;
    }
    cue = CUES.WAIT;
  }
  // Stop the whine and then proceed to part 2
  else if (cue == CUES.STOPWHINE) {
    // Log time
    act = ACTS.DARK;
    lastCue = millis();

    // Stop the whine if it's there
    if (whine) {
      whine.amp(0);
      whine.stop();
    }
    cue = CUES.WAIT;
    setTimeout(function() {
      cue = CUES.STARTDARK;
    }, 5000);
  }
  // Stop cafe noise at the end of part 1
  else if (cue == CUES.STOPBG) {
    bgsound.pause();
    cue = CUES.WAIT;
    setTimeout(function() {
      cue = CUES.STOPWHINE;
    }, WHINETIME - PLAYTIME);
  }
  // Begin installation
  else if (cue == CUES.STARTBG) {
    console.log("LIGHT!");
    // Log time
    act = ACTS.LIGHT;
    lastCue = millis();

    // Ramp up bgsound to mid-volume
    bgsound.setVolume(BGMID, PLAYTIME_IN_SECONDS);

    // Set up whine
    whine = new p5.Oscillator();
    whine.setType('sine');
    whine.freq(BASE * pow(2, 6));
    whine.amp(0);
    whine.amp(WHINEVOL, PLAYTIME);
    whine.start();

    cue = CUES.WAIT;
  } else if (cue == CUES.ENTER) {
    console.log("ENTER!");
    bgsound.loop();
    bgsound.setVolume(BGBEG);
    cue = CUES.WAIT;
  }
}
