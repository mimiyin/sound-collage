void reset() {
  ow = width / numOctaves;
  if (numOctaves <= 2) {
    xshift_mult = -2;
  } else if (numOctaves <= 4) {
    xshift_mult = -1;
  } else {
    xshift_mult = 0;
  }

  try {
    // Update keyboard
    for (int o = 0; o < keyboard.length; o++) {
      for (int n = 0; n < numNotes-1; n++) {
        Note note = keyboard[o][n];
        note.updateX();
      }
    }
  }
  catch(Exception e) {
    println("Unable to update keyboard: " + e);
  }
}

void updateRange() {
  // Change the range with a noisy walker
  float pNumOctaves = numOctaves;
  float t = frameCount * RANGE_RATE;
  numOctaves = (sin((noise(t) * TWO_PI)) * 0.5 + 0.5) * 5;
  //if (frameCount % FR == 0) console.log("num octaves: " + nfs(numOctaves, 0, 2));

  numOctaves = round(numOctaves);
  numOctaves = constrain(numOctaves, 1, TOTAL_OCTAVES);
  if (pNumOctaves != numOctaves) reset();
}

// Paramaters are tonic index and tonic note.
void updateRelativeNotes(int t, Note tn) {
  if (tn.counter <= 0) return;
  // Iterate through ALL the keyboard again for each note.
  for (int o = 0; o < keyboard.length; o++) {
    for (int n = 0; n < numNotes-1; n++) {
      Note note = keyboard[o][n];
      // Calculate the relative note
      int rn = n >= t ? n - t : (n + (numNotes - 1)) - t;
      //float h = ( areas.getFloat(rn) - note.h);
      note.modulate( areas.getFloat(rn), tn.counter * MOD_RATE);
    }
  }
}

void calcRatios() {
  // Calculate scale of areas based on total height of window
  float sum = 0;
  for (int s = 0; s < numNotes-1; s++) {
    sum += areas.getFloat(s);
  }

  mult = height / sum;

  for (int o = 0; o < TOTAL_OCTAVES; o++) {
    float y = height;
    for (int s = 0; s < numNotes-1; s++) {
      JSONObject ratioObj = ratios.getJSONObject(s);
      float ratio = (float) ratioObj.getInt("n") / ratioObj.getInt("d");
      float freq = BASE * ratio * pow(2, o);
      float h = areas.getFloat(s);
      y -= h * mult;
      keyboard[o][s] = new Note(this, freq, o, y, h);
    }
  }
}