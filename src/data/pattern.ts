import Step from './step';

export default class Pattern {
  private enabled: boolean[];
  private steps: (Step | null)[];

  constructor(steps: Step[]) {
    this.steps = steps;
    this.enabled = new Array(steps.length);
  }

  getStep(index: number): Step | null {
    return this.enabled[index] ? this.steps[index] : null;
  }

  isEnabled(index: number): boolean {
    return this.enabled[index] && this.steps[index] != null;
  }
}