/* The landscape of how the
scale is laid out in space */

class Soundscape {
  constructor(s, base, weight, x, y, w, h) {
    this.scale = new Scale(s, base, scales[s]);
    this.ratios = this.scale.ratios;
    this.notes = [];
    this.base = base;
    this.weight = weight;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    for (let n = 0; n < this.ratios.length; n++) {
      this.notes.push(new Tone(base, ratios[this.ratios[n].index].ratio));
    }
  }

  run(current) {
    this.scale.update(current);
    this.display();
  }
}

class Line extends Soundscape {
  constructor(s, base, weight, x, y, w, h) {
    super(s, base, weight, x, y, w, h);
  }

  run(walker) {

    let notes = {};
    var x = 0;
    for (var n = 0; n < this.ratios.length; n++) {
      var ratios = this.ratios[n];
      var w = this.w * ratios[this.weight];
      let isOn = walker.x >= x && walker.x < x + w && walker.y >= this.y && walker.y < this.y + this.h;
      //console.log(ratios.index, this.notes[ratios.index]);
      this.notes[n].run(isOn);
      x += w;
    }

    this.scale.update(this.notes);
  }

  display() {
    stroke(0);
    strokeWeight(1);
    var x = this.x;
    for (var n = 0; n < this.ratios.length; n++) {
      var ratios = this.ratios[n];
      var w = this.w * ratios[this.weight];
      //fill(255);
      noFill();
      rect(x, this.y, w, height);
      x += w;
    }
  }
}