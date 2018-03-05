var Scale = function(_notes){
  var notes = _notes;

  this.run = function(walkers) {
    for (var n = 0; n < notes.length; n++) {
      notes[n].run(walkers);
    }
  }
}