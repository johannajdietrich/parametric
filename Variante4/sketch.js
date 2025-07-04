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
  background(0);

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

  
  background(0, 20);  // Fades previous frames slightly, giving a trail

  let bass = fft.getEnergy("bass");
  let size = map(bass, 0, 255, 50, 400);

  
drawingContext.shadowBlur = 25;
drawingContext.shadowColor = color(100, 150, 255);

noFill();                    // No inside color
stroke(150, 70);  // Light blue-gray stroke with transparency
strokeWeight(2);            // Optional: controls line thickness

ellipse(width / 2, height / 2, size);

drawingContext.shadowBlur = 0; // Always reset after glow drawing


  
let level = mic.getLevel();
console.log("Mic Level:", level); // should change if Loopback is working
  fill(0, 20);
  noStroke();
  rect(0, 0, width, height);

  let spectrum = fft.analyze(32);
  noiseOffset += 0.01;

  let bassEnergy = fft.getEnergy("bass");
  bassShake = map(bassEnergy, 0, 255, 0, 10);  // 1. update the shake amount based on bass

  floatPhase += 0.01;
  floatOffsetX = sin(floatPhase) * bassShake * 2;  // 2. use it after updating
  floatOffsetY = cos(floatPhase * 0.75) * bassShake * 2;

 
  push();
  translate(floatOffsetX, floatOffsetY);

  for (let i = 0; i < spectrum.length; i++) {
    let freq = (i * sampleRate()) / (2 * spectrum.length);
    let energy = spectrum[i];

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
