// Process camera data to detect motion
void processCamera(IPCapture ipcam) {
  // Detect motion from camera
  ipcam.loadPixels();
  processPixels(ipcam.pixels);
}

void processCamera(Capture webcam) {
  // Don't if replaying data
  if (REPLAY) {
    JSONObject obj = replay.getJSONObject(r);
      println(obj.getInt("ts") - startTime);
    if (millis() > obj.getInt("ts") - startTime) {
      float num = obj.getFloat("num");
      addBalls(num);
      r++;
    }
    return;
  }
  // Detect motion from webcamera
  webcam.loadPixels();
  processPixels(webcam.pixels);
}

void processPixels(color[] cam) {
  for (int x=cx; x < cw; x += CAM_SCALE) {
    for (int y=cy; y < ch; y += CAM_SCALE) {
      int pos = x + y * width;
      float b = brightness(cam[pos]);
      if (old[pos] >= 0 && abs(old[pos] - b) > CAM_TH) {
        movement++;
      }
      old[pos] = b;
    }
  }
  // Normalize movement
  movement /= float(cw*ch);

  // Decay m_th
  m_th -= m_th_mult;
  m_th = constrain(m_th, 0.001, 1.1);
  //println("m: " + nfs(movement, 0, 3) + "\tm_th: " + nfs(m_th, 0, 3));

  // When movement reaches a threshold
  if (movement > m_th) {
    float num = movement/m_th;
    num = constrain(num, 0, MAX_NOTE_LENGTH)*cam_mouse;
    addBalls(num);
    movement = 0;

    // Make it harder to create notes by increasing the threshold
    m_th += pow(m_th_mult, m_th_inertia);
    m_th = constrain(m_th, m_th_mult, 1.1);

    println("m_th_inertia: " + nfs(m_th_inertia, 0, 3) + " m_th: " + nfs(m_th, 0, 3));
  }
}

void addBalls(float num) {
  // x, y, w, h, yspeed, lifespan (max is 1 minute)
  float duration = MAX_NOTE_LENGTH*frameRate*num;
  // Choose a random duration using normal distribution
  duration = (randomGaussian()*duration) + (duration/2);
  // Longest note is 1 minute
  duration = constrain(duration, 0, 60*frameRate); 
  balls.add(new Ball(random(width), random(height), 20, 20, random(-1, 1), random(-1, 1), int(duration)));

  // Create new add object
  JSONObject add = new JSONObject();
  add.setInt("ts", millis());
  add.setFloat("num", num);
  recording.append(add);

  // Track longest note
  if (duration > longestNote) longestNote = duration; 

  println("add: " + nfs(num, 0, 3) + " duration: " + nfs(duration/frameRate, 0, 3) + " longest: " + nfs(longestNote/frameRate, 0, 3));
}