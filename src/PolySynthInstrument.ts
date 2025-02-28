import * as Tone from "Tone";
import { Instrument } from "./Instrument";

export class PolySynthInstrument extends Instrument {
  private readonly synth: Tone.PolySynth;

  constructor() {
    super();
    this.synth = new Tone.PolySynth(Tone.Synth);
  }

  toDestination(): this {
    this.synth.toDestination();
    return this;
  }

  attack(notes: number[], velocity: Tone.Unit.NormalRange, time: Tone.Unit.Time = Tone.now()): void {
    let freqs = notes.map(note => Tone.Frequency(note, "midi").toFrequency());
    this.synth.triggerAttack(freqs, time, velocity);
  }

  release(notes: number[], time: Tone.Unit.Time = Tone.now()): void {
    let freqs = notes.map(note => Tone.Frequency(note, "midi").toFrequency());
    this.synth.triggerRelease(freqs, time);
  }

  attackRelease(notes: number[], duration: Tone.Unit.Time, velocity: Tone.Unit.NormalRange, time: Tone.Unit.Time = Tone.now()): void {
    let freqs = notes.map(note => Tone.Frequency(note, "midi").toFrequency());
    this.synth.triggerAttackRelease(freqs, duration, time, velocity)
  }
}