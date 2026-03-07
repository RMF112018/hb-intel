/**
 * Phase 5.15 startup phase taxonomy mirrored in @hbc/auth so adapters/guards
 * can instrument shared startup timing without taking a package dependency on
 * @hbc/shell.
 */
export type StartupPhase = 'runtime-detection' | 'auth-bootstrap' | 'session-restore' | 'permission-resolution' | 'first-protected-shell-render';
/**
 * Optional metadata attached to startup phase timing events.
 */
export interface StartupTimingPhaseMetadata {
    source?: string;
    runtimeMode?: string;
    outcome?: 'success' | 'failure' | 'pending';
    details?: Record<string, unknown>;
}
/**
 * Emit phase-start marker to the registered startup timing bridge.
 */
export declare function startStartupPhase(phase: StartupPhase, metadata?: StartupTimingPhaseMetadata): void;
/**
 * Emit phase-end marker to the registered startup timing bridge.
 */
export declare function endStartupPhase(phase: StartupPhase, metadata?: StartupTimingPhaseMetadata): void;
/**
 * Emit direct phase-duration record to the registered startup timing bridge.
 */
export declare function recordStartupPhase(phase: StartupPhase, durationMs: number, metadata?: StartupTimingPhaseMetadata): void;
//# sourceMappingURL=startupTimingBridge.d.ts.map