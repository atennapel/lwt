import Pattern from './pattern';

export default class Part {
  private patterns: Pattern[];

  constructor(patterns: Pattern[]) {
    this.patterns = patterns;
  }

  getPatterns(): Pattern[] {
    return this.patterns;
  }
}