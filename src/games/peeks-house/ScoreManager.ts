// src/games/peeks-house/ScoreManager.ts
type ScoreListener = (scene: string, score: number) => void;

export class ScoreManager {
  static incrementGamesLost() {
    throw new Error('Method not implemented.');
  }
  static incrementWrongAnswers() {
    throw new Error('Method not implemented.');
  }
  static updateScore(arg0: string, score: number) {
    throw new Error('Method not implemented.');
  }
  private static scores: { [key: string]: number } = {
    JobsScene: 0,
    AimScene: 0,
    PeekScene: 0,
  };

  private static listeners: ScoreListener[] = [];

  private static correctAnswers: number = 0;
  private static incorrectAnswers: number = 0;
  private static gamesPlayed: number = 0;
  private static livesLost: number = 0;

  static setScore(scene: string, score: number) {
    this.scores[scene] = score;
    this.notifyListeners(scene, score);
  }

  static getScore(scene: string): number {
    return this.scores[scene] || 0;
  }

  static getAllScores(): { [key: string]: number } {
    return { ...this.scores };
  }

  static getTotalScore(): number {
    return Object.values(this.scores).reduce((a, b) => a + b, 0);
  }

  static addListener(listener: ScoreListener) {
    this.listeners.push(listener);
  }

  static removeListener(listener: ScoreListener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private static notifyListeners(scene: string, score: number) {
    for (const listener of this.listeners) {
      listener(scene, score);
    }
  }

  static incrementCorrectAnswers(count: number = 1) {
    this.correctAnswers += count;
  }

  static incrementIncorrectAnswers(count: number = 1) {
    this.incorrectAnswers += count;
  }

  static incrementGamesPlayed(count: number = 1) {
    this.gamesPlayed += count;
  }

  static incrementLivesLost(count: number = 1) {
    this.livesLost += count;
  }

  static getCorrectAnswers(): number {
    return this.correctAnswers;
  }

  static getIncorrectAnswers(): number {
    return this.incorrectAnswers;
  }

  static getGamesPlayed(): number {
    return this.gamesPlayed;
  }

  static getLivesLost(): number {
    return this.livesLost;
  }

  static resetStats() {
    this.correctAnswers = 0;
    this.incorrectAnswers = 0;
    this.gamesPlayed = 0;
    this.livesLost = 0;
  }
}
