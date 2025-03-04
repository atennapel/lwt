import { Pattern } from "./Pattern";

export class State {
  private length: number;
  private beat: number;
  private pattern: Pattern;
  private playing: boolean;

  constructor(length: number) {
    this.length = length;
    this.beat = 0;
    this.pattern = new Pattern(length);
    this.playing = false;
  }

  tick() {
    this.beat = (this.beat + 1) % this.length;
  }

  // returns -1 if disabled
  get(index: number): number {
    return this.pattern.get(index);
  }

  getNote(index: number): number {
    return this.pattern.getNote(index);
  }

  setNote(index: number, note: number): void {
    this.pattern.set(index, note, this.pattern.isEnabled(index));
  }

  // returns -1 if disabled
  getCurrent(): number {
    return this.pattern.get(this.beat);
  }

  flip(index: number): void {
    this.pattern.enable(index, this.pattern.get(index) < 0);
  }

  getTick(): number {
    return this.beat;
  }

  isPlaying(): boolean {
    return this.playing;
  }

  setPlaying(enabled: boolean): void {
    this.playing = enabled;
  }

  start(): void { this.setPlaying(true) }

  stop(): void {
    this.beat = 0;
    this.setPlaying(false);
  }
}