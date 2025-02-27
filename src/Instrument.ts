import * as Tone from "Tone";

export abstract class Instrument {
  abstract toDestination(): this;
  abstract attack(notes: Tone.Unit.MidiNote[], velocity: Tone.Unit.NormalRange, time?: Tone.Unit.Time): void;
  abstract release(notes: Tone.Unit.MidiNote[], time?: Tone.Unit.Time): void;
  abstract attackRelease(notes: Tone.Unit.MidiNote[], duration: Tone.Unit.Time, velocity: Tone.Unit.NormalRange, time?: Tone.Unit.Time): void;
}