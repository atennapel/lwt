import Note from './note';

export default class Step {
  // non-empty array of notes
  private notes: Note[];

  // between 0-1
  private velocity: number = 0.8;

  constructor(notes: Note[], velocity: number = 0.8) {
    this.notes = notes;
    this.velocity = velocity;
  }

  getNotes(): Note[] {
    return this.notes;
  }

  getVelocity(): number {
    return this.velocity;
  }
}