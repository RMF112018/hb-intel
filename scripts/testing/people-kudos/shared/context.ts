/**
 * RunContext factory and synthetic ID generators.
 */
import { randomBytes } from 'node:crypto';
import type { HarnessConfig, RunContext } from './types.js';
import { createTokenSource } from './auth.js';

export function generateRunId(): string {
  const iso = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const tag = randomBytes(3).toString('hex');
  return `hbi-${iso}-${tag}`;
}

export function buildSyntheticKudosId(runId: string, seq: number): string {
  return `TEST-HBI-${runId}-${String(seq).padStart(3, '0')}`;
}

export function buildSyntheticHeadline(runId: string, seq: number, label: string): string {
  return `[TEST][HBI] ${runId} ${String(seq).padStart(3, '0')} ${label}`;
}

export function buildSyntheticPrefix(runId: string): string {
  return `TEST-HBI-${runId}-`;
}

export interface CreateRunContextOptions {
  dryRun?: boolean;
  verbose?: boolean;
  explicitToken?: string;
}

export function createRunContext(
  config: HarnessConfig,
  opts: CreateRunContextOptions = {},
): RunContext {
  const runId = generateRunId();
  return {
    config,
    runId,
    dryRun: opts.dryRun ?? true,
    verbose: opts.verbose ?? false,
    getToken: createTokenSource({ siteUrl: config.siteUrl, explicitToken: opts.explicitToken }),
    currentUserId: undefined,
    createdKudosItemIds: [],
    createdAuditItemIds: [],
    results: [],
  };
}
