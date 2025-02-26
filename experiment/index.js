let NOTE_ON = 144;
let NOTE_OFF = 128;

let MODE_INPUT = 0;
let MODE_SEQUENCE = 1;
var mode = MODE_SEQUENCE;
var playing = false;
let modeEl = document.getElementById("mode");
var beat = 0;
var sequenceNo = 0;

let output = "";
let outputEl = document.getElementById("output");

let steps = new Array(16);
for (let i = 0; i < 16; i++) {
  steps[i] = new Array(16);
  for (let j = 0; j < 16; j++) {
    steps[i][j] = false;
  }
}

let synths = [];
synths[0] = new Tone.PolySynth(Tone.Synth);
synths[0].maxPolyphony = 88;
synths[1] = new Tone.Sampler({
  urls: {
    C4: "kick.mp3",
    D4: "snare.mp3",
    E4: "hihat.mp3",
    F4: "tom1.mp3",
    G4: "tom2.mp3",
    A4: "tom3.mp3",
  },
  baseUrl: "https://tonejs.github.io/audio/drum-samples/R8/",
});
synths[0].toDestination();
synths[1].toDestination();
var synthNo = 0;

function updateMode() {
  modeEl.textContent = (mode == MODE_INPUT ? "Input" : "Sequence " + (sequenceNo.toString(16).toUpperCase())) + (" | Synth " + synthNo.toString(16).toUpperCase()) + (playing ? " | Playing" : " | Stopped") + " | " + beat.toString(16).toUpperCase();
}

function updateOutput() {
  var text = "  ";
  for (let i = 0; i < beat; i++) text += "  ";
  text += "v\n  0 1 2 3 4 5 6 7 8 9 A B C D E F\n";
  for (let seqNo = 0; seqNo < 16; seqNo++) {
    text += seqNo.toString(16).toUpperCase() + (seqNo == sequenceNo ? ">" : " ");
    let seq = steps[seqNo];
    for (let i = 0; i < 16; i++) text += (seq[i] ? "1 " : "0 ");
    text += "\n";
  }
  outputEl.textContent = text;
}

(async () => {
  let access = await navigator.requestMIDIAccess();

  Tone.setContext(new Tone.Context({ latencyHint: "interactive" }));

  for (let device of access.inputs.values())
    device.onmidimessage = msg => onMidiMessage(msg, synths[synthNo]);

  document.getElementById("start").addEventListener("click", () => onStart());

  document.addEventListener("keydown", event => {
    if (event.key == "Shift") {
      mode = (mode + 1) % 2;
      updateMode();
    } else if (event.key == " ") {
      playing = !playing;
      if (playing) {
        Tone.Transport.start();
      } else {
        Tone.Transport.stop();
      }
      updateMode();
    } else if (event.key == "ArrowUp") {
      synthNo = (synthNo + 1) % synths.length;
      updateMode();
    } else if (event.key == "ArrowDown") {
      synthNo--;
      if (synthNo < 0) synthNo = synths.length - 1;
      updateMode();
    } else {
      if (mode == MODE_INPUT) {
        let midiNote = keyNotes[event.key];
        if (midiNote && !keyStates[event.key]) {
          keyStates[event.key] = true;
          runKey(NOTE_ON, midiNote, 100, synths[synthNo]);
        }
      } else if (mode = MODE_SEQUENCE) {
        var i = -1;
        switch (event.key) {
          case "q": i = 0; break;
          case "w": i = 1; break;
          case "e": i = 2; break;
          case "r": i = 3; break;
          case "t": i = 4; break;
          case "y": i = 5; break;
          case "u": i = 6; break;
          case "i": i = 7; break;
          case "a": i = 8; break;
          case "s": i = 9; break;
          case "d": i = 10; break;
          case "f": i = 11; break;
          case "g": i = 12; break;
          case "h": i = 13; break;
          case "j": i = 14; break;
          case "k": i = 15; break;

          case "ArrowRight": sequenceNo = (sequenceNo + 1) % 16; break;
          case "ArrowLeft": sequenceNo--; if (sequenceNo < 0) sequenceNo = 15; break;

          default: break;
        }

        if (i > -1) steps[sequenceNo][i] = !steps[sequenceNo][i];

        updateMode();
        updateOutput();
      }
    }
  });
  document.addEventListener("keyup", event => {
    if (mode == MODE_INPUT) {
      let midiNote = keyNotes[event.key];
      if (midiNote) {
        keyStates[event.key] = false;
        runKey(NOTE_OFF, midiNote, 100, synths[synthNo]);
      }
    }
  });

  function tick(time) {
    beat = (beat + 1) % 16;
    for (let seq = 0; seq < 16; seq++) {
      if (steps[seq][beat]) {
        runKey(NOTE_ON, 60 + seq, 100, synths[synthNo], time);
      } else {
        runKey(NOTE_OFF, 60 + seq, 100, synths[synthNo], time);
      }
    }
    updateOutput();
    updateMode();
  }

  Tone.Transport.bpm.value = 120;
  Tone.Transport.scheduleRepeat(tick, "16n");

  updateOutput();
  updateMode();
})().catch(console.error);

function onMidiMessage(msg, synth) {
  let [id, note, vel] = msg.data;
  runKey(id, note, vel, synth)
}

function runKey(id, note, vel, synth, when) {
  let freq = Tone.Frequency(note, "midi").toFrequency();
  if (id == NOTE_ON) {
    synth.triggerAttack([freq], when == undefined ? Tone.immediate() : when, vel / 127 * 0.8);
  } else if (id == NOTE_OFF) {
    synth.triggerRelease([freq]);
  }
}

function onStart() {
  Tone.start();
}

let keyStates = {};
let keyNotes = {
  "z": 48,
  "x": 50,
  "c": 52,
  "v": 53,
  "b": 55,
  "n": 57,
  "m": 59,
  ",": 60,
  ".": 62,
  "/": 64,

  "a": 60,
  "s": 62,
  "d": 64,
  "f": 65,
  "g": 67,
  "h": 69,
  "j": 71,
  "k": 72,
  "l": 74,
  ";": 76,

  "q": 72,
  "w": 74,
  "e": 76,
  "r": 77,
  "t": 79,
  "y": 81,
  "u": 83,
  "i": 84,
  "o": 86,
  "p": 88,
};
