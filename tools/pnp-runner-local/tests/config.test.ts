import { describe, expect, it } from 'vitest';
import { readRunnerConfig } from '../src/config.js';

function withEnv(
  env: Record<string, string | undefined>,
  run: () => void,
): void {
  const original = new Map<string, string | undefined>();
  for (const key of Object.keys(env)) {
    original.set(key, process.env[key]);
    const value = env[key];
    if (typeof value === 'string') {
      process.env[key] = value;
    } else {
      delete process.env[key];
    }
  }
  try {
    run();
  } finally {
    for (const [key, value] of original.entries()) {
      if (typeof value === 'string') {
        process.env[key] = value;
      } else {
        delete process.env[key];
      }
    }
  }
}

describe('readRunnerConfig', () => {
  it('requires API key in non-loopback profile', () => {
    withEnv({
      PNP_RUNNER_HOST: '0.0.0.0',
      PNP_RUNNER_ALLOW_NON_LOOPBACK: 'true',
      PNP_RUNNER_CERT_PATH: '/tmp/cert.pem',
      PNP_RUNNER_KEY_PATH: '/tmp/key.pem',
      PNP_RUNNER_API_KEY: undefined,
    }, () => {
      expect(() => readRunnerConfig()).toThrow('PNP_RUNNER_API_KEY is required');
    });
  });

  it('uses local profile defaults when loopback is configured', () => {
    withEnv({
      PNP_RUNNER_HOST: '127.0.0.1',
      PNP_RUNNER_ALLOW_NON_LOOPBACK: 'false',
      PNP_RUNNER_CERT_PATH: '/tmp/cert.pem',
      PNP_RUNNER_KEY_PATH: '/tmp/key.pem',
      PNP_RUNNER_API_KEY: undefined,
    }, () => {
      const config = readRunnerConfig();
      expect(config.profile).toBe('local-runner');
      expect(config.authRequired).toBe(false);
      expect(config.apiKey).toBeNull();
    });
  });
});
