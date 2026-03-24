/**
 * P3-E11 runtime root barrel for Startup module.
 *
 * Implemented:
 * - T10 Stage 1 foundation — program core, state machine, certification, waivers, blockers.
 * - T10 Stage 2 task-library — governed template catalog, task instances, blockers.
 * - T10 Stage 3 safety-readiness — 32-item safety checklist, remediation, escalation.
 * - T10 Stage 4 permit-posting — Section 4 permit verification details, evidence, non-interference.
 * - T10 Stage 5 contract-obligations — obligation ledger, lifecycle, monitoring, certification.
 * - T10 Stage 6 responsibility-matrix — PM/Field two-sheet routing engine, critical acknowledgment.
 * - T10 Stage 7 execution-baseline — 11-section PM Plan, structured fields, assumptions, signatures.
 */

export * from './foundation/index.js';
export * from './task-library/index.js';
export * from './safety-readiness/index.js';
export * from './permit-posting/index.js';
export * from './contract-obligations/index.js';
export * from './responsibility-matrix/index.js';
export * from './execution-baseline/index.js';
