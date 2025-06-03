let song;
let fft; //p5.FFT object for audio analysis.  
let notes = {}; //An object mapping MIDI note names (e.g., "C4") to color and MIDI number.  
let playing = false;

function preload() {
  song = loadSound("Test-Bounce.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  fft = new p5.FFT(); //Initializes the FFT analyzer.  

  // Assign a random color to all MIDI notes (from 21 = A0 to 108 = C8)
  for (let midi = 21; midi <= 108; midi++) {
    let name = midiToNoteName(midi);
    notes[name] = {
      color: color(random(255), random(255), random(255)),
      midi: midi
    };
  }

  fft.setInput(song); //Connects the FFT to the `song` audio input.
}

function draw() {
  if (!playing) return;

  let spectrum = fft.analyze(16);

  for (let i = 0; i < spectrum.length; i++) {
    let freq = fft.getFreq(i);
    let energy = spectrum[i];

    if (energy > 140) { // Threshold
      let midi = freqToMidi(freq);
      let name = midiToNoteName(midi);

      if (notes[name]) {
        stroke(notes[name].color);
        strokeWeight(random(1, 3));
        noFill();

        // Random stroke style
        if (random() < 0.5) {
          let x1 = random(width);
          let y1 = random(height);
          let x2 = x1 + random(-100, 100);
          let y2 = y1 + random(-100, 100);
          line(x1, y1, x2, y2);
        } else {
          beginShape();
          for (let j = 0; j < 5; j++) {
            vertex(random(width), random(height));
          }
          endShape();
        }
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
