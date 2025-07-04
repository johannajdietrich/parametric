let mic;
let fftFull;    // For full spectrum (bass)
let fftMelody;  // For low-res (melody)

let notes = {};
let baseNoteColors = {};
let noiseOffset = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(RADIANS);
  background(0);
  noFill();

  mic = new p5.AudioIn();
  mic.start();

  // Two different FFTs
  fftFull = new p5.FFT(0.8, 1024);  // High resolution
  fftFull.setInput(mic);

  fftMelody = new p5.FFT(0.8, 128);  // Low resolution
  fftMelody.setInput(mic);

  // Base note colors
  baseNoteColors = {
    "C": color("#E69F00"),
    "C#": color("#56B4E9"),
    "D": color("#009E73"),
    "D#": color("#F0E442"),
    "E": color("#0072B2"),
    "F": color("#D55E00"),
    "F#": color("#CC79A7"),
    "G": color("#999999"),
    "G#": color("#E69F00"),
    "A": color("#56B4E9"),
    "A#": color("#009E73"),
    "B": color("#F0E442")
  };

  // Assign color to each note based on octave
  for (let midi = 21; midi <= 108; midi++) {
    let name = midiToNoteName(midi);
    let note = name.slice(0, -1);
    let octave = parseInt(name.slice(-1));
    let baseColor = baseNoteColors[note] || color(random(255), random(255), random(255));
    let brightness = map(octave, 1, 8, 0.3, 1.2);
    let c = lerpColor(color(0), baseColor, brightness);
    notes[name] = { color: c, midi: midi };
  }
}

function draw() {
  if (!mic.enabled) return;

  background(0, 20);

  // === BASS: Use full spectrum ===
  let fullSpectrum = fftFull.analyze();
  let bassEnergy = fftFull.getEnergy("bass");
  let radius = map(bassEnergy, 0, 255, 150, 300);

  push();
  translate(width / 2, height / 2);
  noFill();
  stroke(100, 150, 255, 180);
  strokeWeight(3);
  drawingContext.shadowBlur = 25;
  drawingContext.shadowColor = color(100, 150, 255);
  ellipse(0, 0, radius * 2, radius * 2);
  drawingContext.shadowBlur = 0;
  pop();

  // === MELODY: Use 32-band low-res spectrum ===
  let melodySpectrum = fftMelody.analyze();

  push();
  for (let i = 0; i < melodySpectrum.length; i++) {
    let freq = (i * sampleRate()) / (2 * melodySpectrum.length);
    let energy = melodySpectrum[i];

    if (energy > 60) {
      let midi = freqToMidi(freq);
      let name = midiToNoteName(midi);

      if (notes[name]) {
        let col = notes[name].color;
        col.setAlpha(150);
        stroke(col);
        strokeWeight(1.5);
        noFill();

        beginShape();
        for (let j = 0; j < 5; j++) {
          let nx = noise(noiseOffset + i * 0.1 + j) * width;
          let ny = noise(noiseOffset + i * 0.2 + j + 100) * height;
          vertex(nx, ny);
        }
        endShape();
      }
    }
  }
  pop();

  noiseOffset += 0.01;
}

function freqToMidi(frequency) {
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

function midiToNoteName(midi) {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  let octave = Math.floor(midi / 12) - 1;
  let note = noteNames[midi % 12];
  return note + octave;
}
