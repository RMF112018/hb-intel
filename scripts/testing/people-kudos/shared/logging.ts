/**
 * Structured logging for the test suite.
 */
import type { RunContext, StepResult, StepStatus } from './types.js';

function iconFor(status: StepStatus): string {
  switch (status) {
    case 'pass': return '✓';
    case 'fail': return '✗';
    case 'warn': return '!';
    case 'skip': return '-';
    case 'dry':  return '·';
  }
}

export function logResult(_ctx: RunContext, result: StepResult): void {
  const prefix = `[${iconFor(result.status)}] ${result.step.padEnd(42)}`;
  const detail = result.detail ? `  ${result.detail}` : '';
  if (result.status === 'fail') {
    console.error(`${prefix}${detail}`);
  } else {
    console.log(`${prefix}${detail}`);
  }
}

export function logDry(ctx: RunContext, intent: string, body?: unknown): void {
  if (!ctx.verbose) return;
  const bodyStr = body ? ` ${JSON.stringify(body).slice(0, 200)}` : '';
  console.log(`  [dry] ${intent}${bodyStr}`);
}

export function summarizeResults(ctx: RunContext): {
  total: number; pass: number; fail: number; warn: number; skip: number; dry: number;
} {
  const s = { total: 0, pass: 0, fail: 0, warn: 0, skip: 0, dry: 0 };
  for (const r of ctx.results) { s.total++; s[r.status]++; }
  return s;
}

export function printSummary(ctx: RunContext): void {
  const s = summarizeResults(ctx);
  console.log('');
  console.log('================= SUMMARY =================');
  console.log(`runId:    ${ctx.runId}`);
  console.log(`dry-run:  ${ctx.dryRun}`);
  console.log(`results:  total=${s.total} pass=${s.pass} fail=${s.fail} warn=${s.warn} skip=${s.skip} dry=${s.dry}`);
  console.log(`created:  kudos=${ctx.createdKudosItemIds.length} audit=${ctx.createdAuditItemIds.length}`);
  console.log('===========================================');
}
