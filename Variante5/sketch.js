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

  background(0, 20);

  fft.analyze(); // update FFT data
  let bassEnergy = fft.getEnergy("bass");
  let radius = map(bassEnergy, 0, 255, 150, 300); // map bass to radius

  push();
  translate(width / 2, height / 2); // center of canvas
  noFill();
  stroke(100, 150, 255, 180); // glowing blue stroke
  strokeWeight(3);
  drawingContext.shadowBlur = 25;
  drawingContext.shadowColor = color(100, 150, 255);

  ellipse(0, 0, radius * 2, radius * 2); // draw the pulsing circle

  drawingContext.shadowBlur = 0;
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
