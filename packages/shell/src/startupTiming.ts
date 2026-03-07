import type {
  StartupBudgetDefinition,
  StartupBudgetValidationResult,
  StartupPhase,
  StartupTimingPhaseMetadata,
  StartupTimingRecord,
  StartupTimingSnapshot,
} from './types.js';

/**
 * Locked Phase 5.15 startup budgets treated as release criteria.
 *
 * Traceability:
 * - PH5.15-Auth-Shell-Plan.md §5.15 items 1-2
 * - PH5-Auth-Shell-Plan.md locked Option C (budgets are non-optional criteria)
 */
export const BALANCED_STARTUP_BUDGETS: Readonly<Record<StartupPhase, number>> = {
  'runtime-detection': 100,
  'auth-bootstrap': 800,
  'session-restore': 500,
  'permission-resolution': 200,
  'first-protected-shell-render': 1500,
};

/**
 * Global bridge contract consumed by @hbc/auth startup instrumentation without
 * creating a package dependency on @hbc/shell.
 */
export interface StartupTimingBridge {
  startPhase: (phase: StartupPhase, metadata?: StartupTimingPhaseMetadata) => void;
  endPhase: (phase: StartupPhase, metadata?: StartupTimingPhaseMetadata) => StartupTimingRecord | null;
  recordPhase: (
    phase: StartupPhase,
    durationMs: number,
    metadata?: StartupTimingPhaseMetadata,
  ) => StartupTimingRecord;
}

interface ActivePhaseState {
  startedAtMs: number;
  metadata?: StartupTimingPhaseMetadata;
}

interface InternalStartupTimingState {
  active: Partial<Record<StartupPhase, ActivePhaseState>>;
  records: StartupTimingRecord[];
  budgets: Record<StartupPhase, number>;
}

const state: InternalStartupTimingState = {
  active: {},
  records: [],
  budgets: { ...BALANCED_STARTUP_BUDGETS },
};

/**
 * Start timing a startup phase.
 */
export function startPhase(phase: StartupPhase, metadata?: StartupTimingPhaseMetadata): void {
  state.active[phase] = {
    startedAtMs: nowMs(),
    metadata,
  };
}

/**
 * End one phase and write a concrete record if a start marker exists.
 */
export function endPhase(
  phase: StartupPhase,
  metadata?: StartupTimingPhaseMetadata,
): StartupTimingRecord | null {
  const active = state.active[phase];
  if (!active) {
    return null;
  }

  const endedAtMs = nowMs();
  const elapsedMs = endedAtMs - active.startedAtMs;
  delete state.active[phase];

  return pushRecord(
    phase,
    elapsedMs,
    {
      ...active.metadata,
      ...metadata,
    },
    active.startedAtMs,
    endedAtMs,
  );
}

/**
 * Record a measured phase duration directly.
 */
export function recordPhase(
  phase: StartupPhase,
  durationMs: number,
  metadata?: StartupTimingPhaseMetadata,
): StartupTimingRecord {
  const endedAtMs = nowMs();
  const startedAtMs = endedAtMs - durationMs;
  return pushRecord(phase, durationMs, metadata, startedAtMs, endedAtMs);
}

/**
 * Retrieve current startup timing snapshot and non-blocking budget validation.
 */
export function getSnapshot(): StartupTimingSnapshot {
  const records = [...state.records];
  const budgets = toBudgetDefinitions(state.budgets);

  return {
    generatedAt: new Date().toISOString(),
    records,
    budgets,
    validation: validateBudgets(records, state.budgets),
  };
}

/**
 * Validate startup records against release budgets.
 *
 * Non-blocking policy:
 * - Violations are reported explicitly for release gating workflows.
 * - Runtime startup flow continues without throwing.
 */
export function validateBudgets(
  records: StartupTimingRecord[] = state.records,
  budgets: Record<StartupPhase, number> = state.budgets,
): StartupBudgetValidationResult {
  const latestByPhase = new Map<StartupPhase, StartupTimingRecord>();
  for (const record of records) {
    latestByPhase.set(record.phase, record);
  }

  const failures: StartupBudgetValidationResult['failures'] = [];
  for (const phase of Object.keys(budgets) as StartupPhase[]) {
    const latest = latestByPhase.get(phase);
    if (!latest) {
      failures.push({
        phase,
        budgetMs: budgets[phase],
        actualMs: null,
        reason: 'missing-measurement',
      });
      continue;
    }

    if (latest.elapsedMs > budgets[phase]) {
      failures.push({
        phase,
        budgetMs: budgets[phase],
        actualMs: latest.elapsedMs,
        reason: 'exceeded-budget',
      });
    }
  }

  return {
    ok: failures.length === 0,
    failures,
  };
}

/**
 * Clear all startup timing state.
 */
export function clear(): void {
  state.records = [];
  state.active = {};
}

/**
 * Replace budgets for explicit preview-profile validation scenarios.
 */
export function setBudgets(definitions: readonly StartupBudgetDefinition[]): void {
  state.budgets = definitions.reduce<Record<StartupPhase, number>>((acc, definition) => {
    acc[definition.phase] = definition.budgetMs;
    return acc;
  }, { ...BALANCED_STARTUP_BUDGETS });
}

/**
 * Register bridge on global runtime so @hbc/auth instrumentation can emit
 * startup phase timings without importing @hbc/shell.
 *
 * Alignment notes:
 * - D-10: preserves package boundary ownership while enabling shared telemetry.
 * - D-12: bridge is data-only and does not couple UI rendering.
 */
export function registerStartupTimingBridge(): StartupTimingBridge {
  const bridge: StartupTimingBridge = {
    startPhase,
    endPhase,
    recordPhase,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__HBC_STARTUP_TIMING_BRIDGE__ = bridge;
  return bridge;
}

function pushRecord(
  phase: StartupPhase,
  elapsedMs: number,
  metadata: StartupTimingPhaseMetadata | undefined,
  startedAtMs: number,
  endedAtMs: number,
): StartupTimingRecord {
  const budgetMs = state.budgets[phase];
  const record: StartupTimingRecord = {
    phase,
    elapsedMs,
    startedAtMs,
    endedAtMs,
    occurredAt: new Date().toISOString(),
    budgetMs,
    withinBudget: elapsedMs <= budgetMs,
    metadata,
  };

  state.records.push(record);
  return record;
}

function toBudgetDefinitions(
  budgets: Record<StartupPhase, number>,
): StartupBudgetDefinition[] {
  return (Object.keys(budgets) as StartupPhase[]).map((phase) => ({
    phase,
    budgetMs: budgets[phase],
  }));
}

function nowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }

  return Date.now();
}

registerStartupTimingBridge();
