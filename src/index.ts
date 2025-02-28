import * as Tone from "tone";
import { SynthInstrument } from "./SynthInstrument";
import { PolySynthInstrument } from "./PolySynthInstrument";
import { Instrument } from "./Instrument";
import { Display } from "./Display";
import { State } from "./state/State";

window.addEventListener("load", () => {
  const start = document.getElementById("start")!
  start.addEventListener("click", async () => {
    start.remove();
    const state = new State(16);
    const display = new Display(state, document.getElementById("display")! as HTMLDivElement);
    display.initialize((x, y) => { state.flip(x + y * 8); display.refresh() });

    Tone.setContext(new Tone.Context({ latencyHint: "interactive", lookAhead: 0 }));

    console.log("Starting Tone...");
    await Tone.start();
    console.log("Started Tone");

    const synth = new SynthInstrument().toDestination();

    let activeSynth: Instrument = new PolySynthInstrument().toDestination();

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
          case "q": state.flip(0); break;
          case "w": state.flip(1); break;
          case "e": state.flip(2); break;
          case "r": state.flip(3); break;
          case "t": state.flip(4); break;
          case "y": state.flip(5); break;
          case "u": state.flip(6); break;
          case "i": state.flip(7); break;
          case "a": state.flip(8); break;
          case "s": state.flip(9); break;
          case "d": state.flip(10); break;
          case "f": state.flip(11); break;
          case "g": state.flip(12); break;
          case "h": state.flip(13); break;
          case "j": state.flip(14); break;
          case "k": state.flip(15); break;
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