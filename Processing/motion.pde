// Process camera data to detect motion
void processCamera(IPCapture ipcam) {
  // Detect motion from camera
  ipcam.loadPixels();
  processPixels(ipcam.pixels);
}

void processCamera(Capture webcam) {
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
        movement+=mspeed;
      }
      old[pos] = b;
    }
  }
  // Normalize movement
  movement /= float(cw*ch);
  m_th -= m_th_mult;
  m_th = constrain(m_th, 0.001, 1.1);
  //println("m: " + nfs(movement, 0, 3) + "\tm_th: " + nfs(m_th, 0, 3));

  // When movement reaches a threshold
  if (movement > m_th) {
    float num = movement/m_th;
    num = constrain(num, 0, MAX_NOTE_LENGTH)*cam_mouse;
    addBalls(num);
    movement = 0;
    m_th += pow(m_th_mult, .5);
  }
}

void addBalls(float num) {
  // x, y, w, h, yspeed, lifespan (max is 1 minute)
  balls.add(new Ball(random(width), random(height), 20, 20, random(-1, 1), random(-1, 1), int(MAX_NOTE_LENGTH*frameRate*num)));
  //mspeed = 1/float(balls.size());
  //mspeed = constrain(mspeed, 0, 1);

  println("ADD BALLS: " + nfs(num, 0, 3) + " DURATION: " + nfs(MAX_NOTE_LENGTH*frameRate*num, 0, 2) + " MSPEED: " + nfs(mspeed, 0, 3) + " M_TH: " + nfs(m_th, 0, 3));
}