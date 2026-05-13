/**
 * Adobe Sign refresh-token authenticated-encryption boundary — B05
 * remediation Prompt 02.
 *
 * Encapsulates the only path through which Adobe Sign refresh-token
 * plaintext crosses into / out of durable storage. Uses AES-256-GCM via
 * `node:crypto`:
 *
 *   - 32-byte key (AES-256),
 *   - 12-byte random IV per encrypt (GCM-recommended),
 *   - 16-byte auth tag,
 *   - cipher version 1.
 *
 * All envelope fields are base64url-encoded so the resulting record can
 * be persisted as plain Azure Table string columns without binary
 * encoding ambiguity.
 *
 * The cipher key is supplied through the Function-App app setting
 * `ADOBE_SIGN_TOKEN_ENCRYPTION_KEY` (base64-encoded 32 bytes). In
 * production it is expected to be deployed as a Key Vault reference
 * (`@Microsoft.KeyVault(SecretUri=...)`) so the raw bytes never appear in
 * source control or operator surfaces.
 *
 * No key bytes, plaintext, or vendor strings are ever logged or echoed
 * in thrown-error message bodies.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-refresh-token-crypto
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import type { EnvLike } from './adobe-sign-config.js';

const ADOBE_SIGN_CIPHER_ALGORITHM = 'aes-256-gcm' as const;
const ADOBE_SIGN_CIPHER_KEY_BYTES = 32;
const ADOBE_SIGN_CIPHER_IV_BYTES = 12;
const ADOBE_SIGN_CIPHER_AUTH_TAG_BYTES = 16;

export const ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV = 'ADOBE_SIGN_TOKEN_ENCRYPTION_KEY' as const;

export interface AdobeSignRefreshTokenCiphertextEnvelope {
  readonly cipherVersion: 1;
  /** base64url-encoded 12-byte IV/nonce. */
  readonly iv: string;
  /** base64url-encoded 16-byte GCM auth tag. */
  readonly authTag: string;
  /** base64url-encoded ciphertext. */
  readonly ciphertext: string;
}

export interface AdobeSignRefreshTokenCipher {
  encrypt(plaintext: string): AdobeSignRefreshTokenCiphertextEnvelope;
  decrypt(envelope: AdobeSignRefreshTokenCiphertextEnvelope): string;
}

export class AdobeSignCipherKeyLengthError extends Error {
  readonly code = 'adobe-sign-cipher-key-length' as const;
  constructor() {
    // No key bytes appear in the message.
    super(
      `Adobe Sign refresh-token cipher key must be exactly ${ADOBE_SIGN_CIPHER_KEY_BYTES} bytes`,
    );
    this.name = 'AdobeSignCipherKeyLengthError';
  }
}

export class AdobeSignCipherEnvelopeError extends Error {
  readonly code = 'adobe-sign-cipher-envelope' as const;
  constructor(reason: 'invalid-iv-length' | 'invalid-auth-tag-length' | 'unsupported-version') {
    super(`Adobe Sign refresh-token cipher envelope rejected: ${reason}`);
    this.name = 'AdobeSignCipherEnvelopeError';
  }
}

function toBase64Url(buf: Buffer): string {
  return buf.toString('base64url');
}

function fromBase64Url(encoded: string): Buffer {
  return Buffer.from(encoded, 'base64url');
}

/**
 * Create a cipher bound to a 32-byte raw key. Throws synchronously when
 * the key is the wrong length — callers must validate via
 * `resolveAdobeSignRefreshTokenCipherKey` first or be prepared to map
 * the error to a `configuration-required` outcome.
 */
export function createAdobeSignRefreshTokenCipher(
  rawKey: Uint8Array,
): AdobeSignRefreshTokenCipher {
  if (rawKey.byteLength !== ADOBE_SIGN_CIPHER_KEY_BYTES) {
    throw new AdobeSignCipherKeyLengthError();
  }
  const key = Buffer.from(rawKey);

  return {
    encrypt(plaintext) {
      const iv = randomBytes(ADOBE_SIGN_CIPHER_IV_BYTES);
      const cipher = createCipheriv(ADOBE_SIGN_CIPHER_ALGORITHM, key, iv);
      const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
      const authTag = cipher.getAuthTag();
      return {
        cipherVersion: 1,
        iv: toBase64Url(iv),
        authTag: toBase64Url(authTag),
        ciphertext: toBase64Url(ciphertext),
      };
    },
    decrypt(envelope) {
      if (envelope.cipherVersion !== 1) {
        throw new AdobeSignCipherEnvelopeError('unsupported-version');
      }
      const iv = fromBase64Url(envelope.iv);
      if (iv.byteLength !== ADOBE_SIGN_CIPHER_IV_BYTES) {
        throw new AdobeSignCipherEnvelopeError('invalid-iv-length');
      }
      const authTag = fromBase64Url(envelope.authTag);
      if (authTag.byteLength !== ADOBE_SIGN_CIPHER_AUTH_TAG_BYTES) {
        throw new AdobeSignCipherEnvelopeError('invalid-auth-tag-length');
      }
      const ciphertext = fromBase64Url(envelope.ciphertext);
      const decipher = createDecipheriv(ADOBE_SIGN_CIPHER_ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      // The native auth-tag check throws on tamper; we let it propagate
      // unchanged (already excludes key/plaintext from message text).
      const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return plaintext.toString('utf8');
    },
  };
}

export type AdobeSignRefreshTokenCipherKeyResolution =
  | { readonly status: 'ok'; readonly key: Uint8Array }
  | {
      readonly status: 'configuration-required';
      readonly missingKey: typeof ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV;
    }
  | {
      readonly status: 'configuration-invalid';
      readonly reason: 'invalid-key-length' | 'invalid-key-encoding';
    };

/**
 * Resolve and validate the cipher key from `env`. Never echoes the key
 * value or its byte length in the failure outcomes.
 */
export function resolveAdobeSignRefreshTokenCipherKey(
  env: EnvLike,
): AdobeSignRefreshTokenCipherKeyResolution {
  const raw = env[ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV];
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return { status: 'configuration-required', missingKey: ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV };
  }
  let decoded: Buffer;
  try {
    // Accept either standard base64 or base64url.
    const normalized = raw.trim().replace(/-/g, '+').replace(/_/g, '/');
    decoded = Buffer.from(normalized, 'base64');
  } catch {
    return { status: 'configuration-invalid', reason: 'invalid-key-encoding' };
  }
  if (decoded.byteLength !== ADOBE_SIGN_CIPHER_KEY_BYTES) {
    return { status: 'configuration-invalid', reason: 'invalid-key-length' };
  }
  return { status: 'ok', key: new Uint8Array(decoded) };
}
