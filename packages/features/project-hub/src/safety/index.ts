/**
 * P3-E8 runtime root barrel for Safety module.
 *
 * Implemented: T01–T09 complete. T10 acceptance gate assessed — contract-level complete.
 *
 * T01: Module scope, operating model, record families, lane ownership, authority matrix,
 *      visibility doctrine, PER exclusion, cross-contract positioning, locked decisions.
 * T02: All 16 record family interfaces, ~32 type unions, 10 lifecycle state transition maps,
 *      embedded sub-interfaces, identity model, governance layer.
 * T03: SSSP governed/instance section shapes, joint approval model (3-party sign-off),
 *      addendum approval (operationallyAffected routing), state machine validation,
 *      material change detection, edit access control, rendered document config.
 * T04: Inspection program: 12-section standard template, normalized scoring algorithm,
 *      scorecard snapshot publication, score trend (4-week rolling window), PER score band,
 *      template governance, corrective action due dates, work queue triggers.
 * T05: Centralized CA ledger governance (overdue computation, severity escalation, work queue),
 *      incident privacy model (3-tier role-based visibility), evidence governance (sensitivity
 *      defaults, retention, LITIGATION_HOLD), composite CA health signals.
 * T06: JHA approval governance (competent person pre-condition, supersession), daily pre-task
 *      validation (JHA reference enforcement, completion criteria), toolbox prompt intelligence
 *      (schedule risk mapping, closure model STANDARD/HIGH_RISK/CRITICAL), weekly talk proof.
 * T07: Orientation governance (topic list, acknowledgment evidence, readiness blocking),
 *      submission review (retry cycles, required types check), certification expiration sweep
 *      (30-day EXPIRING_SOON, cascade to designations), SDS compliance, workforce identity.
 * T08: Readiness evaluation engine: 3-level evaluation (project/subcontractor/activity),
 *      25 blocker definitions (HARD/SOFT), exception model (Safety Manager-only, auto-lapse),
 *      override workflow (joint governance signatures), summary projection, 5 work queue triggers.
 * T09: Publication contracts: composite scorecard (5 dimensions + SafetyPosture), sanitized PER
 *      projection, 18 activity spine events, 25 work queue rules (WQ-SAF-01–25), 8 related items,
 *      7 reports, 6 handoffs, 7 BIC next-move prompts.
 * T10: Implementation closure assessed. 54 of 60 acceptance items satisfied at contract level.
 */

export * from './foundation/index.js';
export * from './records/index.js';
export * from './lifecycle/index.js';
export * from './inspection/index.js';
export * from './corrective-actions/index.js';
export * from './jha-toolbox/index.js';
export * from './compliance/index.js';
export * from './readiness/index.js';
export * from './publication/index.js';
