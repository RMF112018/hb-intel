import { describe, expect, it } from 'vitest';

import {
  LINEAGE_SCOPE,
  SPAWN_ACTIONS,
  LEDGER_TYPES,
  RELATED_ITEM_OBJECT_TYPES,
  CONSTRAINTS_RELATIONSHIP_TYPES,
  SPAWN_PATH_CONFIGS,
  RELATED_ITEM_REGISTRATIONS,
  RELATIONSHIP_TYPE_MAPPINGS,
  SPAWN_ACTION_LABELS,
  LEDGER_TYPE_LABELS,
} from '../../index.js';

describe('P3-E6-T05 contract stability', () => {
  it('LINEAGE_SCOPE is "constraints/lineage"', () => {
    expect(LINEAGE_SCOPE).toBe('constraints/lineage');
  });

  it('locks SPAWN_ACTIONS to exactly 3 values', () => {
    expect(SPAWN_ACTIONS).toEqual(['RiskToConstraint', 'ConstraintToDelay', 'ConstraintToChange']);
    expect(SPAWN_ACTIONS).toHaveLength(3);
  });

  it('locks LEDGER_TYPES to exactly 4 values', () => {
    expect(LEDGER_TYPES).toEqual(['Risk', 'Constraint', 'Delay', 'Change']);
    expect(LEDGER_TYPES).toHaveLength(4);
  });

  it('locks RELATED_ITEM_OBJECT_TYPES to exactly 4 values', () => {
    expect(RELATED_ITEM_OBJECT_TYPES).toEqual(['RiskRecord', 'ConstraintRecord', 'DelayRecord', 'ChangeEventRecord']);
    expect(RELATED_ITEM_OBJECT_TYPES).toHaveLength(4);
  });

  it('locks CONSTRAINTS_RELATIONSHIP_TYPES to exactly 9 values', () => {
    expect(CONSTRAINTS_RELATIONSHIP_TYPES).toHaveLength(9);
  });

  it('SPAWN_PATH_CONFIGS has exactly 3 entries matching SPAWN_ACTIONS', () => {
    expect(SPAWN_PATH_CONFIGS).toHaveLength(3);
    for (const action of SPAWN_ACTIONS) {
      expect(SPAWN_PATH_CONFIGS.find((c) => c.spawnAction === action)).toBeTruthy();
    }
  });

  it('each spawn path config has non-empty inheritedFields', () => {
    for (const config of SPAWN_PATH_CONFIGS) {
      expect(config.inheritedFields.length).toBeGreaterThan(0);
    }
  });

  it('RELATED_ITEM_REGISTRATIONS has exactly 4 entries', () => {
    expect(RELATED_ITEM_REGISTRATIONS).toHaveLength(4);
  });

  it('RELATIONSHIP_TYPE_MAPPINGS has exactly 9 entries', () => {
    expect(RELATIONSHIP_TYPE_MAPPINGS).toHaveLength(9);
  });

  it('SafetyIncident only applies to ConstraintRecord', () => {
    const safety = RELATIONSHIP_TYPE_MAPPINGS.find((m) => m.relationshipType === 'SafetyIncident');
    expect(safety?.applicableTo).toEqual(['ConstraintRecord']);
  });

  it('all label maps are complete', () => {
    for (const a of SPAWN_ACTIONS) expect(SPAWN_ACTION_LABELS[a]).toBeTruthy();
    for (const l of LEDGER_TYPES) expect(LEDGER_TYPE_LABELS[l]).toBeTruthy();
  });
});
