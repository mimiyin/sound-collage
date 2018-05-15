

// Convert ms to MM:SS
String msToMMSS(int ms) {
  // Display the time elapsed in mm:ss;
  float seconds = ms / 1000;
  int minute = int(seconds / 60);
  seconds = seconds % 60;
  return nfs(minute, 2, 0) + ":" + nfs(int(seconds), 2, 0);
}

// Stop timer
void stopTimer(ActionEvent e) {
  ((javax.swing.Timer)e.getSource()).stop();
}


// Generic timer
void setTimer(int t_in_seconds, final Runnable r) {
  javax.swing.Timer t = new javax.swing.Timer(t_in_seconds*1000, new ActionListener() {
    public void actionPerformed(ActionEvent e) {
      r.run(); 
      stopTimer(e);
    }
  });
  t.start();
}

// Fade volume soundfile
void fadeVolume(final SoundFile s, final float startVolume, final float endVolume, float duration) {
  int ms = int(duration*FADE_RESOLUTION*1000);
  javax.swing.Timer t = new javax.swing.Timer(ms, new ActionListener() {
    float volume = startVolume;
    public void actionPerformed(ActionEvent e) {
      s.amp(volume);
      volume += FADE_RESOLUTION;
      if (volume > endVolume) stopTimer(e);
    }
  }
  );
  t.start();
}

// Fade volume oscillater
void fadeVolume(final SinOsc o, final float startVolume, final float endVolume, float duration) {
  int ms = int(duration*FADE_RESOLUTION*1000);
  javax.swing.Timer t = new javax.swing.Timer(ms, new ActionListener() {
    float volume = startVolume;
    public void actionPerformed(ActionEvent e) {
      o.amp(volume);
      volume += FADE_RESOLUTION;
      if (volume > endVolume) stopTimer(e);
    }
  }
  );
  t.start();
}

// Reset cue
void resetCue(int _cue) {
  cue = _cue;
}