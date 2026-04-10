import os from 'node:os';
import path from 'node:path';
import type { RunnerConfig } from './types.js';

function readEnv(name: string): string {
  return (process.env[name] ?? '').trim();
}

function parsePort(value: string, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`Invalid port value for PNP_RUNNER_PORT: ${value}`);
  }
  return parsed;
}

function parseOrigins(value: string): string[] {
  if (!value) {
    return [];
  }
  const origins = value.split(',').map((entry) => entry.trim()).filter(Boolean);
  if (origins.some((origin) => origin.includes('*'))) {
    throw new Error('PNP_RUNNER_ALLOWED_ORIGINS must not include wildcard origins.');
  }
  return origins;
}

function ensureLoopback(host: string, allowNonLoopback: boolean): void {
  const loopbackHosts = new Set(['127.0.0.1', 'localhost', '::1']);
  if (!allowNonLoopback && !loopbackHosts.has(host)) {
    throw new Error(`PNP_RUNNER_HOST must be loopback unless PNP_RUNNER_ALLOW_NON_LOOPBACK=true. Received: ${host}`);
  }
}

export function readRunnerConfig(): RunnerConfig {
  const host = readEnv('PNP_RUNNER_HOST') || '127.0.0.1';
  const port = parsePort(readEnv('PNP_RUNNER_PORT'), 5010);
  const certPath = readEnv('PNP_RUNNER_CERT_PATH');
  const keyPath = readEnv('PNP_RUNNER_KEY_PATH');
  const allowedOrigins = parseOrigins(readEnv('PNP_RUNNER_ALLOWED_ORIGINS'));
  const storageDir = readEnv('PNP_RUNNER_STORAGE_DIR') || path.join(os.homedir(), '.hb-intel', 'pnp-runner-local');
  const authModeRaw = readEnv('PNP_RUNNER_AUTH_MODE');
  const authMode = authModeRaw === 'Interactive' ? 'Interactive' : 'DeviceLogin';
  const clientId = readEnv('PNP_RUNNER_CLIENT_ID') || '9bc3ab49-b65d-410a-85ad-de819febfddc';
  const tenant = readEnv('PNP_RUNNER_TENANT') || 'hedrickbrothers.com';
  const allowNonLoopback = readEnv('PNP_RUNNER_ALLOW_NON_LOOPBACK').toLowerCase() === 'true';

  if (!certPath || !keyPath) {
    throw new Error('HTTPS is required. Set PNP_RUNNER_CERT_PATH and PNP_RUNNER_KEY_PATH.');
  }

  ensureLoopback(host, allowNonLoopback);

  return {
    host,
    port,
    certPath,
    keyPath,
    allowedOrigins,
    storageDir,
    authMode,
    clientId,
    tenant,
    allowNonLoopback,
  };
}
