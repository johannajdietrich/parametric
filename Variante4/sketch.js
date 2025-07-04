let fft;
let mic;
let notes = {};

let noiseOffset = 0;
let floatPhase = 0;
let floatOffsetX = 0;
let floatOffsetY = 0;
let bassShake = 1;

let baseNoteColors = {};

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(RADIANS);
  background(0);
  noFill();

  mic = new p5.AudioIn();
  mic.start();        

  fft = new p5.FFT();
  fft.setInput(mic);

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
  
  for (let midi = 21; midi <= 108; midi++) {
    let name = midiToNoteName(midi);
    let note = name.slice(0, -1);
    let octave = parseInt(name.slice(-1));

    let baseColor = baseNoteColors[note];
    let brightness = map(octave, 1, 8, 0.3, 1.2);
    let c = baseColor ? baseColor : color(random(255), random(255), random(255));
    c = lerpColor(color(0), c, brightness);

    notes[name] = { color: c, midi: midi };
  }
}

function draw() {
  if (!mic.enabled) return;

  background(0, 20); // trailing effect

  // Frequency analysis
  let fullSpectrum = fft.analyze();       // high-res for bass
  let lowResSpectrum = fft.analyze(32);   // low-res for note bursts
  let bassEnergy = fft.getEnergy("bass");
  let wave = fft.waveform();

  // Circular waveform visualization
  push();
  translate(width / 2, height / 2);
  stroke(100, 150, 255, 180);
  strokeWeight(2);
  drawingContext.shadowBlur = 25;
  drawingContext.shadowColor = color(100, 150, 255);

  beginShape();
  for (let i = 0; i < wave.length; i++) {
    let angle = map(i, 0, wave.length, 0, TWO_PI);
    let radius = 200 + wave[i] * 150;
    let x = radius * cos(angle);
    let y = radius * sin(angle);
    vertex(x, y);
  }
  endShape(CLOSE);

  drawingContext.shadowBlur = 0;
  pop();

  // Bass-driven floating shake
  bassShake = map(bassEnergy, 0, 255, 0, 10);
  floatPhase += 0.01;
  floatOffsetX = sin(floatPhase) * bassShake * 2;
  floatOffsetY = cos(floatPhase * 0.75) * bassShake * 2;

  // Floating note burst visuals
  push();
  translate(floatOffsetX, floatOffsetY);

  for (let i = 0; i < lowResSpectrum.length; i++) {
    let freq = (i * sampleRate()) / (2 * lowResSpectrum.length);
    let energy = lowResSpectrum[i];

    if (energy > 50) {
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
