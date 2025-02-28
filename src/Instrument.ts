import * as Tone from "Tone";

export abstract class Instrument {
  abstract toDestination(): this;
  abstract attack(notes: number[], velocity: Tone.Unit.NormalRange, time?: Tone.Unit.Time): void;
  abstract release(notes: number[], time?: Tone.Unit.Time): void;
  abstract attackRelease(notes: number[], duration: Tone.Unit.Time, velocity: Tone.Unit.NormalRange, time?: Tone.Unit.Time): void;
}