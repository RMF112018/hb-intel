/**
 * Phase 5.15 startup phase taxonomy mirrored in @hbc/auth so adapters/guards
 * can instrument shared startup timing without taking a package dependency on
 * @hbc/shell.
 */
export type StartupPhase =
  | 'runtime-detection'
  | 'auth-bootstrap'
  | 'session-restore'
  | 'permission-resolution'
  | 'first-protected-shell-render';

/**
 * Optional metadata attached to startup phase timing events.
 */
export interface StartupTimingPhaseMetadata {
  source?: string;
  runtimeMode?: string;
  outcome?: 'success' | 'failure' | 'pending';
  details?: Record<string, unknown>;
}

interface StartupTimingBridge {
  startPhase: (phase: StartupPhase, metadata?: StartupTimingPhaseMetadata) => void;
  endPhase: (phase: StartupPhase, metadata?: StartupTimingPhaseMetadata) => unknown;
  recordPhase: (
    phase: StartupPhase,
    durationMs: number,
    metadata?: StartupTimingPhaseMetadata,
  ) => unknown;
}

/**
 * Emit phase-start marker to the registered startup timing bridge.
 */
export function startStartupPhase(
  phase: StartupPhase,
  metadata?: StartupTimingPhaseMetadata,
): void {
  getBridge()?.startPhase(phase, metadata);
}

/**
 * Emit phase-end marker to the registered startup timing bridge.
 */
export function endStartupPhase(
  phase: StartupPhase,
  metadata?: StartupTimingPhaseMetadata,
): void {
  getBridge()?.endPhase(phase, metadata);
}

/**
 * Emit direct phase-duration record to the registered startup timing bridge.
 */
export function recordStartupPhase(
  phase: StartupPhase,
  durationMs: number,
  metadata?: StartupTimingPhaseMetadata,
): void {
  getBridge()?.recordPhase(phase, durationMs, metadata);
}

function getBridge(): StartupTimingBridge | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (globalThis as any).__HBC_STARTUP_TIMING_BRIDGE__ as StartupTimingBridge | undefined;
}
