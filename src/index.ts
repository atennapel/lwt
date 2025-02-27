import * as Tone from "tone";
import { SynthInstrument } from "./SynthInstrument";
import { PolySynthInstrument } from "./PolySynthInstrument";
import { Instrument } from "./Instrument";

window.addEventListener("load", () => {
  let clicked = false;
  let beat = 0;
  let playing = false;
  let selected = 0;
  const steps: (Tone.Unit.MidiNote | null)[] = new Array(16);

  const output = document.getElementById("output")!;
  output.innerText = "Click here";
  function draw() {
    let text = "";
    for (let i = 0; i < 16; i++) {
      const note = steps[i];
      let noteStr = note ? Tone.Frequency(note, "midi").toNote().toString() : "---";
      if (noteStr.length == 2) noteStr = `${noteStr[0]}-${noteStr[1]}`;
      text += `${i == beat ? ">" : " "} ${i.toString(16).toUpperCase()} ${i == selected ? `[${noteStr}]` : ` ${noteStr}`}\n`;
    }
    output.innerText = text;
  }

  output.addEventListener("click", async () => {
    if (clicked) return;
    clicked = true;

    Tone.setContext(new Tone.Context({ latencyHint: "interactive", lookAhead: 0 }));

    console.log("Starting Tone...");
    await Tone.start();
    console.log("Started Tone");

    const synth = new SynthInstrument().toDestination();

    let activeSynth: Instrument | null = null;

    const transport = Tone.getTransport()
    transport.bpm.value = 120;
    transport.scheduleRepeat(tick, "16n");

    const noteActive: Map<Tone.Unit.MidiNote, boolean> = new Map();

    const instrumentArea = document.getElementById("instrument")!;
    document.getElementById("load_instrument")!.addEventListener("click", () => {
      const txt = instrumentArea.innerText;
      console.log(txt);
      activeSynth = new PolySynthInstrument().toDestination();
    });

    document.getElementById("midi")!.addEventListener("click", async () => {
      let access = await navigator.requestMIDIAccess();
      for (let device of access.inputs.values()) device.onmidimessage = onMidiMessage;
      function onMidiMessage(msg: MIDIMessageEvent) {
        let [id, note, vel] = msg.data!;
        let NOTE_ON = 144;
        let NOTE_OFF = 128;
        if (id == NOTE_ON) {
          activeSynth?.attack([note as Tone.Unit.MidiNote], vel / 127 * 0.8);
        } else if (id == NOTE_OFF) {
          activeSynth?.release([note as Tone.Unit.MidiNote]);
        }
      }
    });

    window.addEventListener("keydown", event => {
      if (event.key == " ") {
        if (playing) {
          playing = false;
          transport.stop();
        } else {
          playing = true;
          transport.start();
        }
      } else if (event.key == "Enter") {
        if (!steps[selected]) {
          steps[selected] = 60;
        } else {
          steps[selected] = null;
        }
        draw();
      } else if (event.key == "ArrowUp") {
        if (selected > 0) {
          selected--;
          draw();
        }
      } else if (event.key == "ArrowDown") {
        if (selected < 15) {
          selected++;
          draw();
        }
      } else if (event.key == "ArrowLeft") {
        const current = steps[selected];
        if (current && current > 12) {
          steps[selected]!--;
          draw();
        }
      } else if (event.key == "ArrowRight") {
        const current = steps[selected];
        if (current && current < 127) {
          steps[selected]!++;
          draw();
        }
      } else {
        var note = keyToNote(event.key);
        if (note && !noteActive.get(note)) {
          noteActive.set(note, true);
          activeSynth?.attack([note], 0.8);
        }
      }
    });

    window.addEventListener("keyup", event => {
      var note = keyToNote(event.key);
      if (note && noteActive.get(note)) {
        noteActive.set(note, false);
        activeSynth?.release([note]);
      }
    });

    function tick(time: Tone.Unit.Seconds) {
      beat = (beat + 1) % 16;
      const current = steps[beat];
      if (current) synth.attackRelease([current], "8n", 0.8, time);
      draw();
    }

    draw();
  });
});

function keyToNote(key: string): Tone.Unit.MidiNote | null {
  switch (key) {
    case "z": return 60;
    case "s": return 61;
    case "x": return 62;
    case "d": return 63;
    case "c": return 64;
    case "v": return 65;
    case "g": return 66;
    case "b": return 67;
    case "h": return 68;
    case "n": return 69;
    case "j": return 70;
    case "m": return 71;
    case ",": return 72;
    default: return null;
  }
}