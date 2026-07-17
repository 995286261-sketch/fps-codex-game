export class ScoreSystem {
  private score = 0;

  add(value: number) {
    this.score += value;
    return this.score;
  }

  getScore() {
    return this.score;
  }

  reset() {
    this.score = 0;
  }
}
