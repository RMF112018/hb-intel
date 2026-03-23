/**
 * P3-E4 runtime root barrel for Financial module.
 *
 * Implemented: T01 (doctrine/authority), T02 (budget line identity/import),
 * T03 (forecast versioning/checklist), T05 (cash flow), T06 (buyout),
 * T07 (business rules/calculations), T08 (platform integration/annotations).
 *
 * Pending: T04 (forecast summary and GC/GR data model interfaces).
 * T09 acceptance gate: 37/48 items satisfied at contract level; 4 pending T04; 7 runtime/UAT scope.
 */

export * from './types/index.js';
export * from './constants/index.js';
export * from './governance/index.js';
export * from './integrations/index.js';
export * from './computors/index.js';
export * from './validation/index.js';
export * from './import/index.js';
export * from './reference/index.js';
export * from './versioning/index.js';
export * from './cash-flow/index.js';
export * from './buyout/index.js';
export * from './business-rules/index.js';
export * from './spine-events/index.js';
export * from './annotations/index.js';
