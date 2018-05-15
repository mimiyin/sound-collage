// Process camera data to detect motion
void processCamera(IPCapture ipcam) {
  // Detect motion from camera
  ipcam.loadPixels();
  for (int x = cx; x < cw; x += CAM_SCALE) {
    for (int y =cy; y < ch; y += CAM_SCALE) {
      int pos = x + y * width;
      float b = brightness(ipcam.pixels[pos]);
      if (abs(old[pos] - b) > CAM_TH) {
        movement++;
      }
      old[pos] = b;
    }
  }
  // Normalize movement
  movement /= cw*ch;

  //println("m: " + nfs(movement, 0, 3) + "\tm_th: " + nfs(m_th, 0, 2));

  // When movement reaches a threshold
  if (movement > m_th) {
    println("ADD BALLS: " + movement);
    addBalls(movement);
    movement = 0;
  }
}

void addBalls(float num) {
  // x, y, w, h, yspeed, lifespan
  balls.add(new Ball(random(width), random(height), 20, 20, 0, random(-1, 1), int(1000*num)));
}