/**
 * Assertion helpers that record StepResults on the RunContext.
 */
import type { RunContext, StepResult } from './types.js';
import { logResult } from './logging.js';

export function recordResult(ctx: RunContext, result: StepResult): StepResult {
  ctx.results.push(result);
  logResult(ctx, result);
  return result;
}

export function assertFieldEquals<T>(
  ctx: RunContext,
  step: string,
  fieldName: string,
  actual: T,
  expected: T,
): StepResult {
  if (ctx.dryRun) {
    return recordResult(ctx, {
      step,
      status: 'dry',
      detail: `dry-run: would assert ${fieldName} === ${JSON.stringify(expected)}`,
    });
  }
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  return recordResult(ctx, {
    step,
    status: pass ? 'pass' : 'fail',
    detail: `${fieldName}: expected ${JSON.stringify(expected)}, actual ${JSON.stringify(actual)}`,
    evidence: { fieldName, actual, expected },
  });
}

export function assertTruthy(
  ctx: RunContext,
  step: string,
  label: string,
  value: unknown,
): StepResult {
  if (ctx.dryRun) {
    return recordResult(ctx, { step, status: 'dry', detail: `dry-run: would assert ${label} is truthy` });
  }
  return recordResult(ctx, {
    step,
    status: value ? 'pass' : 'fail',
    detail: `${label}: ${value ? 'truthy' : 'falsy (expected truthy)'}`,
  });
}

export function assertDefined(
  ctx: RunContext,
  step: string,
  label: string,
  value: unknown,
): StepResult {
  if (ctx.dryRun) {
    return recordResult(ctx, { step, status: 'dry', detail: `dry-run: would assert ${label} is defined` });
  }
  return recordResult(ctx, {
    step,
    status: value !== undefined && value !== null ? 'pass' : 'fail',
    detail: `${label}: ${value !== undefined && value !== null ? 'defined' : 'undefined/null'}`,
  });
}
