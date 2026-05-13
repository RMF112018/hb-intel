import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV,
  AdobeSignCipherEnvelopeError,
  AdobeSignCipherKeyLengthError,
  createAdobeSignRefreshTokenCipher,
  resolveAdobeSignRefreshTokenCipherKey,
  type AdobeSignRefreshTokenCiphertextEnvelope,
} from './adobe-sign-refresh-token-crypto.js';

const PLAINTEXT = 'refresh_token-9af3-DO-NOT-LEAK';
const KEY_32 = new Uint8Array(randomBytes(32));

describe('createAdobeSignRefreshTokenCipher', () => {
  it('round-trips a plaintext refresh token through encrypt/decrypt', () => {
    const cipher = createAdobeSignRefreshTokenCipher(KEY_32);
    const env = cipher.encrypt(PLAINTEXT);
    expect(env.cipherVersion).toBe(1);
    expect(typeof env.iv).toBe('string');
    expect(typeof env.authTag).toBe('string');
    expect(typeof env.ciphertext).toBe('string');
    expect(cipher.decrypt(env)).toBe(PLAINTEXT);
  });

  it('produces a fresh IV for every encrypt call (nonce reuse rejected)', () => {
    const cipher = createAdobeSignRefreshTokenCipher(KEY_32);
    const a = cipher.encrypt(PLAINTEXT);
    const b = cipher.encrypt(PLAINTEXT);
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  it('throws AdobeSignCipherKeyLengthError when the raw key is not 32 bytes', () => {
    expect(() => createAdobeSignRefreshTokenCipher(new Uint8Array(16))).toThrow(
      AdobeSignCipherKeyLengthError,
    );
    expect(() => createAdobeSignRefreshTokenCipher(new Uint8Array(64))).toThrow(
      AdobeSignCipherKeyLengthError,
    );
  });

  it('rejects decrypt of a tampered ciphertext (authenticated)', () => {
    const cipher = createAdobeSignRefreshTokenCipher(KEY_32);
    const env = cipher.encrypt(PLAINTEXT);
    const tampered: AdobeSignRefreshTokenCiphertextEnvelope = {
      ...env,
      ciphertext: env.ciphertext.replace(/^./, (c) => (c === 'A' ? 'B' : 'A')),
    };
    expect(() => cipher.decrypt(tampered)).toThrow();
  });

  it('rejects decrypt of a tampered auth tag', () => {
    const cipher = createAdobeSignRefreshTokenCipher(KEY_32);
    const env = cipher.encrypt(PLAINTEXT);
    const tampered: AdobeSignRefreshTokenCiphertextEnvelope = {
      ...env,
      authTag: env.authTag.replace(/^./, (c) => (c === 'A' ? 'B' : 'A')),
    };
    expect(() => cipher.decrypt(tampered)).toThrow();
  });

  it('rejects an envelope with an unsupported cipher version', () => {
    const cipher = createAdobeSignRefreshTokenCipher(KEY_32);
    const env = cipher.encrypt(PLAINTEXT);
    expect(() =>
      cipher.decrypt({ ...env, cipherVersion: 2 as unknown as 1 }),
    ).toThrow(AdobeSignCipherEnvelopeError);
  });

  it('rejects an envelope with an IV of the wrong length', () => {
    const cipher = createAdobeSignRefreshTokenCipher(KEY_32);
    const env = cipher.encrypt(PLAINTEXT);
    const shortIv = Buffer.alloc(8).toString('base64url');
    expect(() => cipher.decrypt({ ...env, iv: shortIv })).toThrow(AdobeSignCipherEnvelopeError);
  });

  it('rejects an envelope with an auth tag of the wrong length', () => {
    const cipher = createAdobeSignRefreshTokenCipher(KEY_32);
    const env = cipher.encrypt(PLAINTEXT);
    const shortTag = Buffer.alloc(8).toString('base64url');
    expect(() => cipher.decrypt({ ...env, authTag: shortTag })).toThrow(
      AdobeSignCipherEnvelopeError,
    );
  });

  it('never includes plaintext or key bytes in any thrown error message', () => {
    expect.assertions(2);
    const cipher = createAdobeSignRefreshTokenCipher(KEY_32);
    const env = cipher.encrypt(PLAINTEXT);
    try {
      cipher.decrypt({
        ...env,
        ciphertext: env.ciphertext.replace(/^./, (c) => (c === 'A' ? 'B' : 'A')),
      });
    } catch (err) {
      const message = String((err as Error).message);
      expect(message).not.toContain(PLAINTEXT);
      // The base64url key would, if leaked, appear in part of the message.
      const keyB64 = Buffer.from(KEY_32).toString('base64url');
      expect(message).not.toContain(keyB64);
    }
  });
});

describe('resolveAdobeSignRefreshTokenCipherKey', () => {
  const validBase64Key = Buffer.from(KEY_32).toString('base64');

  it('returns configuration-required when the env var is missing', () => {
    expect(resolveAdobeSignRefreshTokenCipherKey({})).toEqual({
      status: 'configuration-required',
      missingKey: ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV,
    });
  });

  it('returns configuration-required when the env var is whitespace', () => {
    expect(
      resolveAdobeSignRefreshTokenCipherKey({
        [ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV]: '   ',
      }),
    ).toEqual({
      status: 'configuration-required',
      missingKey: ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV,
    });
  });

  it('returns configuration-invalid for a key that decodes to the wrong byte length', () => {
    const shortKey = Buffer.alloc(16).toString('base64');
    expect(
      resolveAdobeSignRefreshTokenCipherKey({
        [ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV]: shortKey,
      }),
    ).toEqual({ status: 'configuration-invalid', reason: 'invalid-key-length' });
  });

  it('returns ok for a valid base64-encoded 32-byte key', () => {
    const resolution = resolveAdobeSignRefreshTokenCipherKey({
      [ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV]: validBase64Key,
    });
    expect(resolution.status).toBe('ok');
    if (resolution.status !== 'ok') return;
    expect(resolution.key.byteLength).toBe(32);
  });

  it('accepts base64url-encoded input as well', () => {
    const base64url = Buffer.from(KEY_32).toString('base64url');
    const resolution = resolveAdobeSignRefreshTokenCipherKey({
      [ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV]: base64url,
    });
    expect(resolution.status).toBe('ok');
  });

  it('never includes the env value in a failure outcome', () => {
    const failureValue = 'leaky-key-value-do-not-echo';
    const resolution = resolveAdobeSignRefreshTokenCipherKey({
      [ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV]: failureValue,
    });
    expect(resolution.status).not.toBe('ok');
    expect(JSON.stringify(resolution)).not.toContain(failureValue);
  });
});
