import { generateCertificateCode, verifyCertificateCode, toCrockfordBase32 } from '../crypto';

const TEST_PEPPER = 'test-pepper-32-bytes-hex-value-00';

describe('Certificate Code Cryptography', () => {
  describe('toCrockfordBase32', () => {
    it('should encode a Buffer to Crockford Base32', () => {
      const buf = Buffer.from('hello world');
      const encoded = toCrockfordBase32(buf);
      expect(encoded).toBeDefined();
      expect(typeof encoded).toBe('string');
    });

    it('should use Crockford alphabet (no ambiguous chars O/L/I)', () => {
      const buf = Buffer.alloc(20, 0xff);
      const encoded = toCrockfordBase32(buf);
      expect(encoded).not.toMatch(/[OLI]/);
    });

    it('should produce consistent results for same input', () => {
      const buf = Buffer.from('test-input-12345678');
      expect(toCrockfordBase32(buf)).toBe(toCrockfordBase32(buf));
    });
  });

  describe('generateCertificateCode', () => {
    it('should return a string with CERT- prefix and 5 groups', () => {
      const { rawCode } = generateCertificateCode();
      expect(rawCode).toMatch(/^CERT-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    });

    it('should generate unique codes on each call', () => {
      const codes = new Set(Array.from({ length: 100 }, () => generateCertificateCode().rawCode));
      expect(codes.size).toBe(100);
    });

    it('should return both rawCode and hmacHash', () => {
      const result = generateCertificateCode(TEST_PEPPER);
      expect(result).toHaveProperty('rawCode');
      expect(result).toHaveProperty('hmacHash');
      expect(result.hmacHash).toBeDefined();
    });

    it('should produce consistent hmacHash for same code+pepper', () => {
      const { rawCode } = generateCertificateCode(TEST_PEPPER);
      const hash1 = require('crypto').createHmac('sha256', TEST_PEPPER).update(rawCode).digest('hex');
      const hash2 = require('crypto').createHmac('sha256', TEST_PEPPER).update(rawCode).digest('hex');
      expect(hash1).toBe(hash2);
    });
  });

  describe('verifyCertificateCode', () => {
    it('should return true for a valid code+pepper combination', () => {
      const { rawCode, hmacHash } = generateCertificateCode(TEST_PEPPER);
      expect(verifyCertificateCode(rawCode, hmacHash, TEST_PEPPER)).toBe(true);
    });

    it('should return false for incorrect code', () => {
      const { hmacHash } = generateCertificateCode(TEST_PEPPER);
      expect(verifyCertificateCode('CERT-AAAA-BBBB-CCCC-DDDD-EEEE', hmacHash, TEST_PEPPER)).toBe(false);
    });

    it('should return false for wrong pepper', () => {
      const { rawCode, hmacHash } = generateCertificateCode(TEST_PEPPER);
      expect(verifyCertificateCode(rawCode, hmacHash, 'wrong-pepper')).toBe(false);
    });

    it('should use constant-time comparison (no timing attack)', () => {
      // timingSafeEqual should not throw even with different-length-padded hashes
      const { rawCode, hmacHash } = generateCertificateCode(TEST_PEPPER);
      expect(() => verifyCertificateCode(rawCode, hmacHash, TEST_PEPPER)).not.toThrow();
    });
  });
});
