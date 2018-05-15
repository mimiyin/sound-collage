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
    frameRate(FR);
    if (RECORD) {
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
      note.updateY(y);
      if(!select) note.show();
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
  rect(0, height - 50, width, 100);
  fill(255);

  // Cue Status
  let actTitle;
  for (let a in ACTS) {
    if (ACTS[a] == act) actTitle = a;
  }
  text("Act " + act + ": " + actTitle + "\tFPS: " + int(frameRate()), 20, height - 50);
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
  //if (frameCount % FR == 0) console.log("num octaves: " + nfs(numOctaves, 0, 2));

  numOctaves = round(numOctaves);
  numOctaves = constrain(numOctaves, 1, TOTAL_OCTAVES);
  if (pNumOctaves != numOctaves) reset();
}

function addBalls(num) {
  num = constrain(num, 0, 10);
  console.log("ADD BALLS: " + num);
  if (RECORD) recordJSON.data.push({
    m: millis(),
    num: num
  });
  balls.push(new Ball(random(width), random(height), 20, 20, random(-1, 1), random(-1, 1), MAX_NOTE_LENGTH * frameRate() * num));
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

function processCamera() {
  // Detect motion from camera
  loadPixels();
  for (let x = cx; x < cw; x += CAM_SCALE) {
    for (let y =cy; y < ch; y += CAM_SCALE) {
      let pos = (x + y * width) * 4;
      let b = pixels[pos];
      if ((abs(old[pos] - b) > CAM_TH)) {
        movement++;
      }
      old[pos] = b;
    }
  }

  movement /= (cw*ch*4);

  console.log("m: " + nfs(movement, 0, 3) + " m_th: " + nfs(m_th, 0, 3));

  // When movement reaches a threshold
  if (movement > m_th) {
    addBalls(CAM_TO_MOUSE_RATIO*movement/m_th);
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
    console.log("RETURN!");
    // Log time
    act = ACTS.RETURN;
    lastCue = millis();

    // Fade it in over 5 seconds
    bgsound.loop();
    bgsound.setVolume(0);
    setTimeout(function() {
      bgsound.setVolume(BGEND, 10);
    }, 1000)
    cue = 0;
  }
  // Let sound die out
  else if (cue == CUES.STOPDARK) {
    console.log("STOP DARK!");
    // Log time
    act = ACTS.END;
    lastCue = millis();
    // Do nothing, just fading out sound
    cue = CUES.WAIT;
  }
  // REPLAY recorded data until the end
  else if (cue == CUES.STARTDARK) {
    console.log("START DARK!");
    // Log time
    act = ACTS.DARK;
    lastCue = millis();

    if (REPLAY) {
      if (time > rpdata[rp].m + PLAYTIME + WHINETIME) {
        addBalls(rpdata[rp].num);
        rp++;
        if (rp >= rpdata.length - 1) part = 3;
      }
    } else if (!ipcam) {
      // Set up video
      ipcam = new Image();
      ipcam.onload = function() {
        console.log("GOT FEED!");
        let ctx = document.getElementsByTagName('canvas')[0].getContext('2d');
        setInterval(function() {
          if (act != ACTS.DARK) return;
          ctx.drawImage(ipcam, 0, 0, CW, CH);
          processCamera(ipcam);

          // Draw selection
          if(select) {
            noFill();
            stroke('red');
            rect(cx, cy, cw, ch);
          }
        }, 34);
      }
      ipcam.src = IPCAM_ADDRESS;
    }
    cue = CUES.WAIT;
  }
  // Stop the whine and then proceed to part 2
  else if (cue == CUES.STOPWHINE) {
    console.log("STOP WHINE!");
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
    console.log("STOP BG!");
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
    whine.start();
    setTimeout(function() {
      whine.amp(WHINEVOL, PLAYTIME_IN_SECONDS);
    }, 1000);

    cue = CUES.WAIT;
    setTimeout(function() {
      cue = CUES.STOPBG;
    }, PLAYTIME);
  }
  // Play bgsound when people enter
  else if (cue == CUES.ENTER) {
    console.log("ENTER!");
    bgsound.loop();
    bgsound.setVolume(BGBEG);
    cue = CUES.WAIT;
  }
}

// Press a key to save the data
function keyPressed() {
  if(key == 's') saveJSON(recordJSON, "record.json");
  if(parseInt(key)) cue = key;

  // Change motion threshold for creating notes
  switch (keyCode) {
    case UP_ARROW:
      m_th += m_th_mult;
      break;
    case DOWN_ARROW:
      m_th -= cw * ch * m_th_mult;
      break;
  }
  // Make it possible to not be able to create new notes
  m_th = constrain(m_th, 0, 1.1);
}

// Set area to analyze
function mousePressed() {
  if(!select) return;
  cx = mouseX;
  cy = mouseY;
  cx = constrain(cx, 0, CW);
  cy = constrain(cy, 0, CH);
}

function mouseReleased() {
  if(!select) return;
  cw = mouseX - cx;
  ch = mouseY - cy;
  cw = constrain(cw, 0, CW);
  ch = constrain(ch, 0, CH);
  console.log(cx, cy, cw, ch);
}
