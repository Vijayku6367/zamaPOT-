// utils/encryption.ts

/**
 * MobileFHEEncryptor - Simulates Fully Homomorphic Encryption for mobile devices
 * This class provides mock encryption for demonstration purposes
 * In a real implementation, this would use actual FHE libraries
 */
export class MobileFHEEncryptor {
  private static readonly ENCRYPTION_PREFIX = 'enc_';
  private static readonly SEPARATOR = '_';
  
  /**
   * Generates random hexadecimal string of specified length
   * @param length - Length of the hex string to generate
   * @returns Random hex string
   */
  private static generateRandomHex(length: number): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  /**
   * Simulates FHE encryption of a single answer
   * @param answer - The answer to encrypt (0, 1, 2, 3, etc.)
   * @returns Encrypted string representation
   */
  static encryptAnswer(answer: number): string {
    if (answer < 0 || !Number.isInteger(answer)) {
      throw new Error('Answer must be a non-negative integer');
    }

    // Generate encryption components
    const salt = this.generateRandomHex(16);
    const nonce = this.generateRandomHex(8);
    const timestamp = Date.now().toString(16);
    
    // Simulate FHE encryption process
    const encrypted = `${this.ENCRYPTION_PREFIX}${answer}${this.SEPARATOR}${salt}${this.SEPARATOR}${nonce}${this.SEPARATOR}${timestamp}`;
    
    console.log(`🔐 Encrypted answer ${answer} -> ${encrypted.substring(0, 20)}...`);
    return encrypted;
  }

  /**
   * Encrypts multiple answers using FHE simulation
   * @param answers - Array of answers to encrypt
   * @returns Array of encrypted answers
   */
  static encryptAnswers(answers: number[]): string[] {
    if (!Array.isArray(answers)) {
      throw new Error('Answers must be an array');
    }

    console.log(`🔐 Starting FHE encryption for ${answers.length} answers...`);
    
    const encryptedAnswers = answers.map((answer, index) => {
      try {
        return this.encryptAnswer(answer);
      } catch (error) {
        console.error(`❌ Failed to encrypt answer at index ${index}:`, error);
        throw error;
      }
    });

    console.log(`✅ Successfully encrypted ${encryptedAnswers.length} answers`);
    return encryptedAnswers;
  }

  /**
   * Generates a unique user ID for session tracking
   * @returns Unique user identifier
   */
  static generateUserId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = this.generateRandomHex(8);
    const userId = `user_${timestamp}_${randomPart}`;
    
    console.log(`👤 Generated user ID: ${userId}`);
    return userId;
  }

  /**
   * Simulates FHE key generation
   * @returns Mock public/private key pair
   */
  static generateKeyPair(): { publicKey: string; privateKey: string } {
    const publicKey = `pk_${this.generateRandomHex(32)}`;
    const privateKey = `sk_${this.generateRandomHex(64)}`;
    
    console.log(`🔑 Generated FHE key pair`);
    return { publicKey, privateKey };
  }

  /**
   * Simulates FHE homomorphic addition on encrypted data
   * @param encryptedData1 - First encrypted value
   * @param encryptedData2 - Second encrypted value
   * @returns Result of homomorphic addition
   */
  static homomorphicAdd(encryptedData1: string, encryptedData2: string): string {
    console.log(`➕ Performing homomorphic addition...`);
    
    // Extract numeric parts for simulation
    const num1 = this.extractNumberFromEncrypted(encryptedData1);
    const num2 = this.extractNumberFromEncrypted(encryptedData2);
    
    const result = num1 + num2;
    const salt = this.generateRandomHex(16);
    
    return `${this.ENCRYPTION_PREFIX}${result}${this.SEPARATOR}${salt}${this.SEPARATOR}homomorphic_add`;
  }

  /**
   * Simulates FHE homomorphic multiplication on encrypted data
   * @param encryptedData1 - First encrypted value
   * @param encryptedData2 - Second encrypted value
   * @returns Result of homomorphic multiplication
   */
  static homomorphicMultiply(encryptedData1: string, encryptedData2: string): string {
    console.log(`✖️ Performing homomorphic multiplication...`);
    
    // Extract numeric parts for simulation
    const num1 = this.extractNumberFromEncrypted(encryptedData1);
    const num2 = this.extractNumberFromEncrypted(encryptedData2);
    
    const result = num1 * num2;
    const salt = this.generateRandomHex(16);
    
    return `${this.ENCRYPTION_PREFIX}${result}${this.SEPARATOR}${salt}${this.SEPARATOR}homomorphic_multiply`;
  }

  /**
   * Extracts the original number from encrypted string (for simulation purposes)
   * @param encryptedData - Encrypted string
   * @returns Original number
   * @private
   */
  private static extractNumberFromEncrypted(encryptedData: string): number {
    if (!encryptedData.startsWith(this.ENCRYPTION_PREFIX)) {
      throw new Error('Invalid encrypted data format');
    }

    const parts = encryptedData.split(this.SEPARATOR);
    if (parts.length < 2) {
      throw new Error('Malformed encrypted data');
    }

    const numberPart = parts[0].replace(this.ENCRYPTION_PREFIX, '');
    return parseInt(numberPart, 10);
  }

  /**
   * Validates if a string is properly encrypted
   * @param data - Data to validate
   * @returns True if data appears to be encrypted
   */
  static isValidEncryptedData(data: string): boolean {
    return data.startsWith(this.ENCRYPTION_PREFIX) && data.includes(this.SEPARATOR);
  }

  /**
   * Generates encryption metadata for tracking
   * @returns Encryption metadata object
   */
  static generateEncryptionMetadata(): {
    algorithm: string;
    version: string;
    timestamp: number;
    sessionId: string;
  } {
    return {
      algorithm: 'FHE-SIMULATION-V1',
      version: '1.0.0',
      timestamp: Date.now(),
      sessionId: this.generateRandomHex(16)
    };
  }

  /**
   * Simulates batch encryption for better performance
   * @param answers - Array of answers to encrypt
   * @returns Batch encrypted data
   */
  static encryptAnswersBatch(answers: number[]): {
    encryptedData: string[];
    metadata: any;
    batchId: string;
  } {
    console.log(`🔐 Starting batch FHE encryption for ${answers.length} answers...`);
    
    const startTime = Date.now();
    const encryptedData = this.encryptAnswers(answers);
    const endTime = Date.now();
    
    const metadata = {
      ...this.generateEncryptionMetadata(),
      batchSize: answers.length,
      processingTime: endTime - startTime,
      averageTimePerAnswer: (endTime - startTime) / answers.length
    };

    const batchId = `batch_${this.generateRandomHex(8)}`;

    console.log(`✅ Batch encryption completed in ${metadata.processingTime}ms`);
    
    return {
      encryptedData,
      metadata,
      batchId
    };
  }

  /**
   * Calculates encrypted score from encrypted answers
   * @param encryptedAnswers - Array of encrypted answers
   * @param correctAnswers - Array of correct answer indices
   * @returns Encrypted score and metadata
   */
  static calculateEncryptedScore(
    encryptedAnswers: string[], 
    correctAnswers: number[]
  ): { encryptedScore: string; correctCount: number; totalQuestions: number } {
    
    if (encryptedAnswers.length !== correctAnswers.length) {
      throw new Error('Answers and correct answers arrays must have same length');
    }

    let correctCount = 0;
    
    // Simulate FHE comparison without decryption
    for (let i = 0; i < encryptedAnswers.length; i++) {
      const userAnswer = this.extractNumberFromEncrypted(encryptedAnswers[i]);
      if (userAnswer === correctAnswers[i]) {
        correctCount++;
      }
    }

    // Encrypt the final score
    const encryptedScore = this.encryptAnswer(correctCount);
    
    console.log(`📊 Calculated encrypted score: ${correctCount}/${encryptedAnswers.length} correct`);
    
    return {
      encryptedScore,
      correctCount,
      totalQuestions: encryptedAnswers.length
    };
  }

  /**
   * Simulates FHE-based cheating detection
   * @param encryptedAnswers - Array of encrypted answers
   * @param behaviorData - User behavior data during quiz
   * @returns Cheating likelihood score (0-1)
   */
  static detectCheatingPattern(
    encryptedAnswers: string[],
    behaviorData: {
      answerTimes: number[];
      switchCounts: number[];
      totalTime: number;
    }
  ): number {
    console.log(`🕵️ Analyzing behavior patterns for cheating detection...`);
    
    let suspicionScore = 0;
    
    // Analyze answer timing patterns
    const avgTime = behaviorData.answerTimes.reduce((a, b) => a + b, 0) / behaviorData.answerTimes.length;
    const timeVariance = behaviorData.answerTimes.reduce((acc, time) => acc + Math.pow(time - avgTime, 2), 0) / behaviorData.answerTimes.length;
    
    if (timeVariance < 0.5) {
      suspicionScore += 0.3; // Too consistent timing
    }
    
    // Analyze answer switching patterns
    const totalSwitches = behaviorData.switchCounts.reduce((a, b) => a + b, 0);
    if (totalSwitches > encryptedAnswers.length * 0.5) {
      suspicionScore += 0.4; // Excessive answer switching
    }
    
    // Analyze total time
    const expectedTime = encryptedAnswers.length * 30; // 30 seconds per question expected
    if (behaviorData.totalTime < expectedTime * 0.3) {
      suspicionScore += 0.3; // Completed too quickly
    }
    
    // Normalize to 0-1 range
    const cheatingLikelihood = Math.min(1, Math.max(0, suspicionScore));
    
    console.log(`🎯 Cheating likelihood detected: ${(cheatingLikelihood * 100).toFixed(1)}%`);
    
    return cheatingLikelihood;
  }
}

/**
 * Utility functions for FHE operations
 */
export const FHEUtils = {
  /**
   * Validates encrypted data format
   */
  validateEncryptedFormat: (data: string): boolean => {
    return MobileFHEEncryptor.isValidEncryptedData(data);
  },

  /**
   * Generates session-specific encryption context
   */
  createEncryptionContext: (sessionId: string) => ({
    sessionId,
    timestamp: Date.now(),
    contextId: `ctx_${MobileFHEEncryptor.generateRandomHex(8)}`,
    encryptionVersion: 'FHE-SIM-1.0'
  }),

  /**
   * Simulates FHE-based random number generation
   */
  generateEncryptedRandom: (min: number, max: number): string => {
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return MobileFHEEncryptor.encryptAnswer(randomNum);
  }
};

// Default export
export default MobileFHEEncryptor;
