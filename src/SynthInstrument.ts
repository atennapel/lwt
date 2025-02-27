import * as Tone from "Tone";
import { Instrument } from "./Instrument";

export class SynthInstrument extends Instrument {
  private readonly synth: Tone.Synth;

  constructor() {
    super();
    this.synth = new Tone.Synth();
  }

  toDestination(): this {
    this.synth.toDestination();
    return this;
  }

  attack(notes: Tone.Unit.MidiNote[], velocity: Tone.Unit.NormalRange, time: Tone.Unit.Time = Tone.now()): void {
    let freq = Tone.Frequency(notes[0], "midi").toFrequency();
    this.synth.triggerAttack(freq, time, velocity);
  }

  release(_: Tone.Unit.MidiNote[], time: Tone.Unit.Time = Tone.now()): void {
    this.synth.triggerRelease(time);
  }

  attackRelease(notes: Tone.Unit.MidiNote[], duration: Tone.Unit.Time, velocity: Tone.Unit.NormalRange, time: Tone.Unit.Time = Tone.now()): void {
    let freq = Tone.Frequency(notes[0], "midi").toFrequency();
    this.synth.triggerAttackRelease(freq, duration, time, velocity)
  }
}