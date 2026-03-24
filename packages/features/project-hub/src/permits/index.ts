/**
 * P3-E7 runtime root barrel for Permits module.
 *
 * Implemented: T01–T07.
 *
 * T01: Product shape, scope, doctrine, thread model, authority, compliance health derivation.
 * T02: 7 record families, 15+ enumerations, supporting types, responsibility envelopes.
 * T03: Application + IssuedPermit lifecycles, PermitLifecycleAction transitions, governance.
 * T04: Checkpoint templates, inspection workflow, deficiency tracking, compliance health, closeout gate.
 * T05: Activity spine, health spine, work queue, related items, handoffs, BIC next-move, PER annotations.
 * T06: UX surfaces, view columns, health indicators, dashboard tiles, reports, PER annotation UX.
 * T07: Migration mapping, status/result tables, import config, versioned record, future integration.
 */

export * from './foundation/index.js';
export * from './records/index.js';
export * from './lifecycle/index.js';
export * from './inspection/index.js';
export * from './workflow/index.js';
export * from './views/index.js';
export * from './migration/index.js';
