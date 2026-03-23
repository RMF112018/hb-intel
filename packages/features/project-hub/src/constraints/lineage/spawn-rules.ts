/**
 * P3-E6-T05 Spawn rules and lineage factory.
 * Pure functions for spawn eligibility, seed data extraction, and lineage record creation.
 */

import type { SpawnAction } from './enums.js';
import type { ILineageRecord, ISpawnEligibilityResult, ISpawnSeedResult } from './types.js';
import { SPAWN_PATH_CONFIGS } from './constants.js';
import type { IRiskRecord } from '../risk-ledger/types.js';
import type { IConstraintRecord } from '../constraint-ledger/types.js';
import { isTerminalRiskStatus } from '../risk-ledger/state-machine.js';
import { isTerminalConstraintStatus } from '../constraint-ledger/state-machine.js';

/**
 * Get the spawn path configuration for a given spawn action.
 */
export const getSpawnPathConfig = (spawnAction: SpawnAction) =>
  SPAWN_PATH_CONFIGS.find((c) => c.spawnAction === spawnAction) ?? null;

/**
 * Extract seed data from a parent record based on the spawn action.
 * Returns the inherited field names and their values at spawn time.
 */
export const getSpawnSeedData = (
  spawnAction: SpawnAction,
  parentRecord: Record<string, unknown>,
): ISpawnSeedResult => {
  const config = getSpawnPathConfig(spawnAction);
  if (!config) {
    return { inheritedFields: [], inheritedValues: {} };
  }

  const inheritedValues: Record<string, unknown> = {};
  for (const field of config.inheritedFields) {
    if (field in parentRecord) {
      inheritedValues[field] = parentRecord[field];
    }
  }

  return {
    inheritedFields: [...config.inheritedFields],
    inheritedValues,
  };
};

/**
 * L-01: Check whether a Risk record is eligible to spawn a Constraint.
 * Risk must not be in a terminal status and must not already be in MaterializationPending
 * (which would indicate a spawn is already in progress).
 */
export const canSpawnFromRisk = (
  record: Pick<IRiskRecord, 'status'>,
): ISpawnEligibilityResult => {
  const reasons: string[] = [];

  if (isTerminalRiskStatus(record.status)) {
    reasons.push(`Risk is in terminal status '${record.status}'. Cannot spawn from terminal records.`);
  }

  return { eligible: reasons.length === 0, reasons };
};

/**
 * Check whether a Constraint record is eligible to spawn a Delay or Change Event.
 * Constraint must not be in a terminal status.
 * L-04: Multiple spawns are allowed from a single constraint.
 */
export const canSpawnFromConstraint = (
  record: Pick<IConstraintRecord, 'status'>,
): ISpawnEligibilityResult => {
  const reasons: string[] = [];

  if (isTerminalConstraintStatus(record.status)) {
    reasons.push(`Constraint is in terminal status '${record.status}'. Cannot spawn from terminal records.`);
  }

  return { eligible: reasons.length === 0, reasons };
};

/**
 * L-02: Create an immutable lineage record for a spawn action.
 * All fields are set at creation and never modified.
 */
export const createLineageRecord = (params: {
  lineageId: string;
  projectId: string;
  spawnAction: SpawnAction;
  parentRecordId: string;
  parentRecordNumber: string;
  childRecordId: string;
  childRecordNumber: string;
  spawnedAt: string;
  spawnedBy: string;
  inheritedFields: readonly string[];
  inheritedValues: Readonly<Record<string, unknown>>;
}): ILineageRecord => {
  const config = getSpawnPathConfig(params.spawnAction);

  return {
    lineageId: params.lineageId,
    projectId: params.projectId,
    spawnAction: params.spawnAction,
    parentLedger: config?.parentLedger ?? 'Risk',
    parentRecordId: params.parentRecordId,
    parentRecordNumber: params.parentRecordNumber,
    childLedger: config?.childLedger ?? 'Constraint',
    childRecordId: params.childRecordId,
    childRecordNumber: params.childRecordNumber,
    spawnedAt: params.spawnedAt,
    spawnedBy: params.spawnedBy,
    inheritedFields: [...params.inheritedFields],
    inheritedValues: { ...params.inheritedValues },
  };
};
