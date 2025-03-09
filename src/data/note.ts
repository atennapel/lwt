import * as Tone from 'tone';

export default class Note {
  // MIDI note (0 - 127, 60 = C4)
  private note: number;
  private frequency: Tone.Unit.Frequency;

  constructor(note: number) {
    this.note = note;
    this.frequency = Tone.Frequency(this.note, "midi").toFrequency();
  }

  getNote(): number {
    return this.note;
  }

  toFrequency(): Tone.Unit.Frequency {
    return this.frequency;
  }
}