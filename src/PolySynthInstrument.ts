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

  attack(notes: Tone.Unit.MidiNote[], velocity: Tone.Unit.NormalRange, time: Tone.Unit.Time = Tone.now()): void {
    let freqs = notes.map(note => Tone.Frequency(note, "midi").toFrequency());
    this.synth.triggerAttack(freqs, time, velocity);
  }

  release(notes: Tone.Unit.MidiNote[], time: Tone.Unit.Time = Tone.now()): void {
    let freqs = notes.map(note => Tone.Frequency(note, "midi").toFrequency());
    this.synth.triggerRelease(freqs, time);
  }

  attackRelease(notes: Tone.Unit.MidiNote[], duration: Tone.Unit.Time, velocity: Tone.Unit.NormalRange, time: Tone.Unit.Time = Tone.now()): void {
    let freqs = notes.map(note => Tone.Frequency(note, "midi").toFrequency());
    this.synth.triggerAttackRelease(freqs, duration, time, velocity)
  }
}