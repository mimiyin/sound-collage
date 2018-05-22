void time() {

  // Update current timer
  timers[act] = millis() - lastCue;

  timer = "";
  int totalTime = 0;
  for (int i = 0; i < ACTS.LENGTH; i++) {
    totalTime += timers[i];
    timer += actTitles[i] + ":" + msToMMSS(timers[i]) + " ";
  }
  timer += "TOTAL:" + msToMMSS(totalTime);

  // Start up cafe sound again for the end
  if (cue == CUES.RETURN) {
    println("RETURN!");
    // Log time
    act = ACTS.RETURN;
    lastCue = millis();

    // KILL ALL NOTES
    for (int o = 0; o < keyboard.length; o++) {
      for (int n = 0; n < numNotes-1; n++) {
        Note note = keyboard[o][n];
        note.kill();
      }
    }

    // Stop sand sound to cue Ryan
    sand.stop();

    // Start up cafe sound again
    bgsound.amp(0);
    bgsound.loop();

    // Wait 1 second, Fade it in over 10 seconds
    setTimer(10, new Runnable() {
      @Override
        public void run() {
        fadeVolume(bgsound, 0, BGEND, 10);
      }
    }
    );
    cue = CUES.WAIT;
  } else if (cue == CUES.STARTSAND) {

    // Play sand sound to cue Ryan
    sand.amp(SANDVOL);
    sand.loop();

    // Wait for next cue
    cue = CUES.WAIT;
  }
  // Let sound die out
  else if (cue == CUES.STOPDARK) {
    println("STOP DARK!");

    // Save recording
    int y = year();
    int m = month();
    int d = day();
    int h = hour();
    int s = second();
    String ts = str(y)+str(m)+str(d)+str(h)+str(s);
    saveJSONArray(recording, "data/recording_" + ts + ".json");

    // Log time
    act = ACTS.END;
    lastCue = millis();
    // Do nothing, just fading out sound
    cue = CUES.WAIT;
  }
  // REPLAY recorded data until the end
  else if (cue == CUES.STARTDARK) {
    println("START DARK!");
    // Log time
    act = ACTS.DARK;
    lastCue = millis();

    if (useIP && ipcam == null) {
      println("STARTING IPCAM");
      // Set up video
      ipcam = new IPCapture(this, IPCAM_ADDRESS, "", "");
      ipcam.start();
    } else if (!useIP && webcam == null) {
      // Set up video
      webcam = new Capture(this, CW, CH);
      webcam.start();
    }
    cue = CUES.WAIT;
  }
  // Stop the whine and then proceed to part 2
  else if (cue == CUES.STOPWHINE) {
    println("STOP WHINE!");
    // Stop the whine if it's there
    if (whine != null) {
      whine.amp(0);
      whine.stop();
    }
    // Automatically proceed to next cue
    cue = CUES.WAIT;
  }
  // Stop cafe noise at the end of part 1
  else if (cue == CUES.STOPBG) {
    println("STOP BG!");
    bgsound.amp(0);
    bgsound.stop();

    // Set up whine
    whine = new SinOsc(this);
    whine.freq(BASE * pow(2, 6));
    whine.amp(WHINEVOL);
    whine.play();

    // Automatically stop whine
    setTimer(WHINETIME, new Runnable() {
      @Override
        public void run() {
        resetCue(CUES.STOPWHINE);
      }
    }
    );

    cue = CUES.WAIT;
  }
  // Begin installation
  else if (cue == CUES.STARTBG) {
    println("LIGHT!");
    // Log time
    act = ACTS.LIGHT;
    lastCue = millis();

    // Ramp up bgsound to mid-volume
    fadeVolume(bgsound, BGBEG, BGMID, PLAYTIME);

    // Set up whine
    //whine = new SinOsc(this);
    //whine.freq(BASE * pow(2, 6));
    //whine.amp(0);
    //whine.play();
    //// Fade in Whine at the end of PLAYTIME
    //setTimer(PLAYTIME-WHINETIME, new Runnable() {
    //  @Override
    //    public void run() {
    //    fadeVolume(whine, 0, WHINEVOL, WHINETIME);
    //  }
    //}
    //);

    // Automatically proceed to next cue
    cue = CUES.WAIT;
    setTimer(PLAYTIME, new Runnable() {
      @Override
        public void run() {
        resetCue(CUES.STOPBG);
      }
    }
    );
  }
  // Play bgsound when people enter
  else if (cue == CUES.ENTER) {
    println("ENTER!");
    // Log time
    act = ACTS.ENTER;
    lastCue = millis();

    // Start up BG sound
    bgsound.amp(BGBEG);
    bgsound.loop();

    cue = CUES.WAIT;
  }
}