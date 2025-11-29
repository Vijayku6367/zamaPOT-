export class MobileFHEEncryptor {
  private static generateRandomHex(length: number): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  static encryptAnswer(answer: number): string {
    // Simulate FHE encryption for mobile
    const salt = this.generateRandomHex(16);
    const encrypted = `enc_${answer}_${salt}`;
    console.log(`🔐 Encrypted answer ${answer} -> ${encrypted}`);
    return encrypted;
  }

  static encryptAnswers(answers: number[]): string[] {
    return answers.map(answer => this.encryptAnswer(answer));
  }

  static generateUserId(): string {
    return `user_${this.generateRandomHex(8)}`;
  }
}
