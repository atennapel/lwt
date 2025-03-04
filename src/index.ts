import * as Tone from "tone";
import { SynthInstrument } from "./SynthInstrument";
import { PolySynthInstrument } from "./PolySynthInstrument";
import { Instrument } from "./Instrument";
import { Display } from "./Display";
import { State } from "./state/State";
import { SamplerInstrument } from "./SamplerInstrument";

window.addEventListener("load", () => {
  const start = document.getElementById("start")!
  start.addEventListener("click", async () => {
    let lastIx = 0;
    start.remove();
    const state = new State(16);
    const display = new Display(state, document.getElementById("display")! as HTMLDivElement);
    display.initialize((x, y) => { lastIx = x + y * 8; state.flip(lastIx); display.refresh() });

    Tone.setContext(new Tone.Context({ latencyHint: "interactive", lookAhead: 0 }));

    console.log("Starting Tone...");
    await Tone.start();
    console.log("Started Tone");

    // const synth = new SynthInstrument().toDestination();

    let activeSynth: Instrument = new SamplerInstrument(
      "https://tonejs.github.io/audio/drum-samples/KPR77/",
      { "C4": "kick.mp3", "D4": "snare.mp3", "E4": "hihat.mp3", "F4": "tom1.mp3", "G4": "tom2.mp3", "A4": "tom3.mp3" },
    ).toDestination(); // new PolySynthInstrument().toDestination();

    const synth = activeSynth;

    const transport = Tone.getTransport()
    transport.bpm.value = 120;
    transport.scheduleRepeat(tick, "16n");

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
        if (state.isPlaying()) {
          state.stop();
          transport.stop();
          display.refresh();
        } else {
          state.start();
          transport.start();
          display.refresh();
        }
      } else {
        switch (event.key) {
          case "q": lastIx = 0; state.flip(0); break;
          case "w": lastIx = 1; state.flip(1); break;
          case "e": lastIx = 2; state.flip(2); break;
          case "r": lastIx = 3; state.flip(3); break;
          case "t": lastIx = 4; state.flip(4); break;
          case "y": lastIx = 5; state.flip(5); break;
          case "u": lastIx = 6; state.flip(6); break;
          case "i": lastIx = 7; state.flip(7); break;
          case "a": lastIx = 8; state.flip(8); break;
          case "s": lastIx = 9; state.flip(9); break;
          case "d": lastIx = 10; state.flip(10); break;
          case "f": lastIx = 11; state.flip(11); break;
          case "g": lastIx = 12; state.flip(12); break;
          case "h": lastIx = 13; state.flip(13); break;
          case "j": lastIx = 14; state.flip(14); break;
          case "k": lastIx = 15; state.flip(15); break;

          case "z": state.setNote(lastIx, state.getNote(lastIx) - 1); break;
          case "x": state.setNote(lastIx, state.getNote(lastIx) + 1); break;

          default: break;
        }
        display.refresh();
      }
    });

    function tick(time: Tone.Unit.Seconds) {
      display.refresh();
      const current = state.getCurrent();
      if (current >= 0) synth.attackRelease([current], "8n", 0.8, time);
      state.tick();
    }

    display.refresh();
  });
});