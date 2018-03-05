var Scale = function (name, indices) {
  this.name = name;
  this.ratios = [];
  var sumDissonance = 0;
  var sumConsonance = 0;
  var sumRandom = 0;

  for (var i = 0; i < indices.length; i++) {
    var index = indices[i];
    var ratio = ratios[index];
    sumRandom += ratio.random;
    sumDissonance += ratio.dissonance;
    sumConsonance += ratio.consonance;
  }

  // Calculate normalized dissonance and consonance weights
  for (var i = 0; i < indices.length; i++) {
    var index = indices[i];
    var ratio = ratios[index];
    var normRatio = {
      index: index,
      dissonance: ratio.dissonance /= sumDissonance,
      consonance: ratio.consonance /= sumConsonance,
      random: ratio.random /= sumRandom,
      even: 1 / indices.length,
    }
    this.ratios.push(normRatio);
  }

  this.update = function (notes) {
    var sumDissonance = 0;
    var sumConsonance = 0;

    for (var r = 0; r < this.ratios.length; r++) {
      var thisRatio = this.ratios[r];
      var thisIndex = thisRatio.index;
      for (var n in notes) {
        var relativeIndex = abs(thisIndex - n);
        var weight = min(notes[n].counter / COUNTER_MAX, 1)*0.001;
        var relativeDissonance = ratios[relativeIndex].dissonance * weight;
        var relativeConsonance = ratios[relativeIndex].consonance * weight;
        thisRatio.dissonance += relativeDissonance;
        thisRatio.consonance += relativeConsonance;
      }
      sumDissonance += thisRatio.dissonance;
      sumConsonance += thisRatio.consonance;
    }

    for (var r = 0; r < this.ratios.length; r++) {
      var thisRatio = this.ratios[r];
      thisRatio.dissonance /= sumDissonance;
      thisRatio.consonance /= sumConsonance;
    }
  }

}