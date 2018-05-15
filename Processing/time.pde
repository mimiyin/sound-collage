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

    bgsound.loop();
    bgsound.amp(0);

    // Wait 1 second, Fade it in over 10 seconds
    setTimer(1, new Runnable() {
      @Override
        public void run() {
        fadeVolume(bgsound, 0, BGEND, 10);
      }
    }
    );
    //setTimeout(function() {
    //  bgsound.setVolume(BGEND, 10);
    //}, 1000)
    cue = CUES.WAIT;
  }
  // Let sound die out
  else if (cue == CUES.STOPDARK) {
    println("STOP DARK!");
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

    if (ipcam == null) {
      // Set up video
      ipcam = new IPCapture(this, IPCAM_ADDRESS, "", "");
      ipcam.start();
    }
    cue = CUES.WAIT;
  }
  // Stop the whine and then proceed to part 2
  else if (cue == CUES.STOPWHINE) {
    println("STOP whine!");
    // Stop the whine if it's there
    if (whine != null) {
      whine.amp(0);
      whine.stop();
    }
    // Automatically proceed to next cue
    cue = CUES.WAIT;
    setTimer(5, new Runnable() {
      @Override
        public void run() {
        resetCue(CUES.STARTDARK);
      }
    }
    );
    //setTimeout(function() {
    //  cue = cues.get("STARTDARK");
    //}
    //, 5000);
  }
  // Stop cafe noise at the end of part 1
  else if (cue == CUES.STOPBG) {
    println("STOP BG!");
    bgsound.stop();
    cue = CUES.WAIT;

    // Automatically stop whine
    setTimer(WHINETIME, new Runnable() {
      @Override
        public void run() {
        resetCue(CUES.STARTDARK);
      }
    }
    );
    //setTimeout(function() {
    //  cue = cues.get("STOPwhine");
    //}
    //, WHINETIME - PLAYTIME);
  }
  // Begin installation
  else if (cue == CUES.STARTBG) {
    println("LIGHT!");
    // Log time
    act = ACTS.LIGHT;
    lastCue = millis();

    // Ramp up bgsound to mid-volume
    fadeVolume(bgsound, 0, BGMID, PLAYTIME);

    // Set up whine
    whine = new SinOsc(this);
    whine.freq(BASE * pow(2, 6));
    whine.amp(0);
    whine.play();
    // Fade in Whine after a second
    // Wait 1 second, Fade it in over 10 seconds
    setTimer(1, new Runnable() {
      @Override
        public void run() {
        fadeVolume(whine, 0, WHINEVOL, PLAYTIME);
      }
    }
    );
    //setTimeout(function() {
    //  whine.amp(whineVOL, PLAYTIME_IN_SECONDS);
    //}, 1000);

    // Automatically proceed to next cue
    cue = CUES.WAIT;
    setTimer(PLAYTIME, new Runnable() {
      @Override
        public void run() {
        resetCue(CUES.STOPBG);
      }
    }
    );
    //  setTimeout(function() {
    //    cue = cues.get("STOPBG");
    //  }, PLAYTIME);
  }
  // Play bgsound when people enter
  else if (cue == CUES.ENTER) {
    println("ENTER!");
    bgsound.loop();
    bgsound.amp(BGBEG);
    cue = CUES.WAIT;
  }
}