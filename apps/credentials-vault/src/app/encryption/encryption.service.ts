import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface EncryptedData {
  data: string;
  iv: string;
  authTag: string;
}

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    // In production, this should come from environment variables or secure key management
    this.key = crypto.scryptSync(process.env.ENCRYPTION_PASSWORD || 'default-key', 'salt', 32);
  }

  encrypt(plaintext: string): EncryptedData {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(this.algorithm, this.key);
      cipher.setAAD(Buffer.from('credential-vault', 'utf8'));

      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      return {
        data: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      this.logger.error(`Encryption failed: ${error.message}`);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(encryptedData: EncryptedData): string {
    try {
      const decipher = crypto.createDecipher(this.algorithm, this.key);
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      decipher.setAAD(Buffer.from('credential-vault', 'utf8'));

      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error(`Decryption failed: ${error.message}`);
      throw new Error('Failed to decrypt data');
    }
  }

  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  compareHash(data: string, hash: string): boolean {
    const dataHash = this.hash(data);
    return crypto.timingSafeEqual(Buffer.from(dataHash), Buffer.from(hash));
  }

  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { publicKey, privateKey };
  }
}
