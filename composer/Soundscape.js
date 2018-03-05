// Landscape object
var Soundscape = function (s, base, weight, x, y, w, h) {
  this.scale = new Scale(s, scales[s]);
  this.ratios = this.scale.ratios;
  this.base = base;
  this.weight = weight;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;

  Soundscape.prototype.run = function (current) {
    this.scale.update(current);
    this.display();
  }

}

var Line = function (s, base, weight, x, y, w, h) {
  Soundscape.call(this, s, base, weight, x, y, w, h);

  this.getNote = function (walker) {
    var x = 0;
    for (var n = 0; n < this.ratios.length; n++) {
      var note = this.ratios[n];
      var w = this.w * note[weight];
      if (walker.x >= x && walker.x < x + w && walker.y >= y && walker.y < y + h) {
        return note;
      }
      x += w;
    }
  }

  this.display = function () {
    stroke(0);
    strokeWeight(1);
    var x = this.x;
    for (var n = 0; n < this.ratios.length; n++) {
      var note = this.ratios[n];
      var w = this.w * note[weight];
      //fill(255);
      noFill();
      rect(x, this.y, w, h);
      x += w;
    }
  }

}

Line.prototype = Object.create(Soundscape.prototype);
Line.constructor = Line;