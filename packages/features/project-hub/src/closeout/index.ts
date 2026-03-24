/**
 * P3-E10 runtime root barrel for Closeout module.
 *
 * Implemented:
 * - T01 foundation — operating model, scope, surface map, SoT boundaries.
 * - T02 records — record families, identity, field architecture, publication states.
 * - T03 checklist — execution checklist, template library, overlay model.
 * - T04 lifecycle — state machine, milestones, evidence gates, approval rules.
 * - T05 lessons — lessons learned operating model and intelligence publication.
 * - T06 scorecard — subcontractor scorecard model and intelligence publication.
 * - T07 autopsy — project autopsy and learning legacy.
 */

export * from './foundation/index.js';
export * from './records/index.js';
export * from './checklist/index.js';
export * from './lifecycle/index.js';
export * from './lessons/index.js';
export * from './scorecard/index.js';
export * from './autopsy/index.js';
