/* Just the consonance/dissonance
data about scale notes*/

class Scale {

  constructor(name, base, indices) {
    this.name = name;
    this.ratios = [];
    let sumRandom = 0;
    let sumDissonance = 0;
    let sumConsonance = 0;

    for (let i = 0; i < indices.length; i++) {
      let index = indices[i];
      let note = ratios[index];
      sumRandom += note.random;
      sumDissonance += note.dissonance;
      sumConsonance += note.consonance;
    }

    // Calculate normalized dissonance and consonance weights
    for (let i = 0; i < indices.length; i++) {
      let index = indices[i];
      let note = ratios[index];
      let normRatio = {
        index: index,
        dissonance: note.dissonance /= sumDissonance,
        consonance: note.consonance /= sumConsonance,
        random: note.random /= sumRandom,
        even: 1 / indices.length
      }
      this.ratios.push(normRatio);
    }
  }

  update(notes) {
    let sumDissonance = 0;
    let sumConsonance = 0;

    for (let n = 0; n < notes.length; n++) {
      for (let r = 0; r < this.ratios.length; r++) {
        let thisRatio = this.ratios[r];
        let thisIndex = thisRatio.index;
        let relativeIndex = abs(thisIndex - n);
        let weight = min(notes[n].counter / COUNTER_MAX, 1) * 0.01;
        let relativeDissonance = ratios[relativeIndex].dissonance * weight;
        let relativeConsonance = ratios[relativeIndex].consonance * weight;
        thisRatio.dissonance += relativeDissonance;
        thisRatio.consonance += relativeConsonance;

        // sumDissonance += thisRatio.dissonance;
        // sumConsonance += thisRatio.consonance;
      }
    }

    for (let r = 0; r < this.ratios.length; r++) {
      let thisRatio = this.ratios[r];
      thisRatio.dissonance /= sumDissonance;
      thisRatio.consonance /= sumConsonance;
    }
  }
}