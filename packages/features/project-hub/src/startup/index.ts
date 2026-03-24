/**
 * P3-E11 runtime root barrel for Startup module.
 *
 * Implemented:
 * - T10 Stage 1 foundation — program core, state machine, certification, waivers, blockers.
 * - T10 Stage 2 task-library — governed template catalog, task instances, blockers.
 * - T10 Stage 3 safety-readiness — 32-item safety checklist, remediation, escalation.
 */

export * from './foundation/index.js';
export * from './task-library/index.js';
export * from './safety-readiness/index.js';
