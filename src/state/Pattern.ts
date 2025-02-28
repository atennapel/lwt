export class Pattern {
  private length: number;
  private enabled: boolean[];
  private notes: number[];

  constructor(length: number = 16) {
    this.length = length;
    this.enabled = new Array(length);
    this.notes = new Array(length);
    this.clear(true);
  }

  clear(clearNotes: boolean = false): void {
    for (let i = 0; i < this.length; i++)
      this.enabled[i] = false;
    if (clearNotes) {
      for (let i = 0; i < this.length; i++)
        this.notes[i] = 60;
    }
  }

  set(index: number, note: number, enabled: boolean = true): void {
    this.enabled[index] = enabled;
    this.notes[index] = note;
  }

  enable(index: number, enabled: boolean = true): void {
    this.enabled[index] = enabled;
  }

  disable(index: number): void {
    this.enable(index, false);
  }

  // returns -1 if disabled
  get(index: number): number {
    return this.enabled[index] ? this.notes[index] : -1;
  }
}