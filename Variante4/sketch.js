let song;
let fft;
let notes = {};
let playing = false;

let noiseOffset = 0;

//  Custom note color mapping
const customNoteColors = {
  "C4": "#214F4B",  //grün-grau  
  "D4": "#909CC2", //bleuliches grau 
  "E4": "#D1D646", //helles grün 
  "F4": "#FF7F11", //orange 
  "G4": "#7F2CCB", //french violette 
  "A4": "#EF2D56", // red
  "B4": "#8F00FF",
  "C5": "#FF69B4",
};

function preload() {
  song = loadSound("Test-Bounce.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  fft = new p5.FFT();
  fft.setInput(song);

  // Set up custom or random colors for MIDI notes
  for (let midi = 21; midi <= 108; midi++) {
    let name = midiToNoteName(midi);
    notes[name] = {
      color: color(customNoteColors[name] || random(255), random(255), random(255)),
      midi: midi
    };
  }
}

function draw() {
  if (!playing) return;

  // Fading trail effect
  noStroke();
  fill(0, 20); // lower alpha = longer trails
  rect(0, 0, width, height);

  let spectrum = fft.analyze(32);
  noiseOffset += 0.01;

  for (let i = 0; i < spectrum.length; i++) {
    let freq = (i * sampleRate()) / (2 * spectrum.length);
    let energy = spectrum[i];

    if (energy > 140) {
      let midi = freqToMidi(freq);
      let name = midiToNoteName(midi);

      if (notes[name]) {
        let col = notes[name].color;
        col.setAlpha(150);
        stroke(col);
        strokeWeight(map(noise(noiseOffset + i), 0, 1, 0.5, 2.5));
        noFill();

        beginShape();
        for (let j = 0; j < 5; j++) {
          let nx = noise(noiseOffset + i * 0.1 + j) * width;
          let ny = noise(noiseOffset + i * 0.2 + j + 100) * height;

          if (j % 2 === 0) {
            curveVertex(nx, ny);
          } else {
            vertex(nx, ny);
          }
        }
        endShape();
      }
    }
  }
}

function mousePressed() {
  if (!song.isPlaying()) {
    background(0);
    song.play();
    playing = true;
  } else {
    song.pause();
    playing = false;
  }
}

function keyPressed() {
  if (key === ' ') {
    if (!song.isPlaying()) {
      background(0);
      song.play();
      playing = true;
    } else {
      song.pause();
      playing = false;
    }
  }  
}

// --- Helpers ---

function freqToMidi(frequency) {
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

function midiToNoteName(midi) {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  let octave = Math.floor(midi / 12) - 1;
  let note = noteNames[midi % 12];
  return note + octave;
}
