let song;
let fft;
let playing = false;

let noteColors = {
  "C": "#FF4C4C",
  "C#": "#FF884C",
  "D": "#FFD24C",
  "D#": "#AFFF4C",
  "E": "#4CFF88",
  "F": "#4CFFD2",
  "F#": "#4CAFFF",
  "G": "#4C4CFF",
  "G#": "#884CFF",
  "A": "#D24CFF",
  "A#": "#FF4CFF",
  "B": "#FF4CAF"
};

let noiseOffset = 0;

function preload() {
  song = loadSound("Test-Bounce.mp3");
}

function setup() {
  createCanvas(800, 600);
  background(0);
  fft = new p5.FFT();
  fft.setInput(song);
}

function draw() {
  if (!playing) return;

  // Fading trail background
  fill(0, 40);
  noStroke();
  rect(0, 0, width, height);

  let spectrum = fft.analyze();

  for (let i = 0; i < spectrum.length; i += 4) {
    let freq = fft.getFreq(i);
    let energy = spectrum[i];

    if (energy > 40) {
      let midi = freqToMidi(freq);
      let noteName = midiToNoteName(midi).replace(/[0-9]/g, "");
      let col = noteColors[noteName] || "#FFFFFF";

      stroke(col);
      strokeWeight(1.5);
      noFill();

      beginShape();
      for (let j = 0; j < 6; j++) {
        let x = noise(noiseOffset + j * 0.1 + i) * width;
        let y = noise(noiseOffset + j * 0.2 + i + 50) * height;
        if (j % 2 === 0) {
          curveVertex(x, y);
        } else {
          vertex(x, y);
        }
      }
      endShape();
    }
  }

  noiseOffset += 0.003;
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

// Convert frequency to MIDI note
function freqToMidi(frequency) {
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

// Convert MIDI note to name (e.g., C4, D#3)
function midiToNoteName(midi) {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  let octave = Math.floor(midi / 12) - 1;
  let note = noteNames[midi % 12];
  return note + octave;
}
