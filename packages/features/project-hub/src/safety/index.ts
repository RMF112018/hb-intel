/**
 * P3-E8 runtime root barrel for Safety module.
 *
 * Implemented: T01–T03 complete.
 *
 * T01: Module scope, operating model, record families, lane ownership, authority matrix,
 *      visibility doctrine, PER exclusion, cross-contract positioning, locked decisions.
 * T02: All 16 record family interfaces, ~32 type unions, 10 lifecycle state transition maps,
 *      embedded sub-interfaces, identity model, governance layer.
 * T03: SSSP governed/instance section shapes, joint approval model (3-party sign-off),
 *      addendum approval (operationallyAffected routing), state machine validation,
 *      material change detection, edit access control, rendered document config.
 */

export * from './foundation/index.js';
export * from './records/index.js';
export * from './lifecycle/index.js';
