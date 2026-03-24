/**
 * P3-E7 runtime root barrel for Permits module.
 *
 * Implemented: T01 (Foundation), T02 (Records), T03 (Lifecycle), T04 (Inspection), T05 (Workflow).
 *
 * T01: Product shape, scope, doctrine, thread model, authority, compliance health derivation.
 * T02: 7 record families, 15+ enumerations, supporting types, responsibility envelopes.
 * T03: Application + IssuedPermit lifecycles, PermitLifecycleAction transitions, governance.
 * T04: Checkpoint templates, inspection workflow, deficiency tracking, compliance health, closeout gate.
 * T05: Activity spine, health spine, work queue, related items, handoffs, BIC next-move, PER annotations.
 */

export * from './foundation/index.js';
export * from './records/index.js';
export * from './lifecycle/index.js';
export * from './inspection/index.js';
export * from './workflow/index.js';
