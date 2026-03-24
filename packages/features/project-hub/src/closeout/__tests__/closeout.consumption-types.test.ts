import { describe, expect, it } from 'vitest';

import {
  CLOSEOUT_DATA_CLASSES,
  CLOSEOUT_ORG_INDEXES,
  CLOSEOUT_HEALTH_SPINE_DIMENSIONS,
  CLOSEOUT_DATA_CLASS_DEFINITIONS,
  CLOSEOUT_ORG_INDEX_DEFINITIONS,
  CLOSEOUT_SEARCH_DIMENSIONS,
  CLOSEOUT_CONSUMPTION_SURFACES,
  CLOSEOUT_ACTIVITY_SPINE_EVENTS,
  CLOSEOUT_HEALTH_SPINE_METRICS,
  CLOSEOUT_REPORT_ARTIFACT_FAMILIES,
  CLOSEOUT_SNAPSHOT_PRECONDITIONS,
  CLOSEOUT_UI_DATA_CLASS_RULES,
  CLOSEOUT_DATA_CLASS_LABELS,
  CLOSEOUT_ORG_INDEX_LABELS,
  CLOSEOUT_HEALTH_SPINE_DIMENSION_LABELS,
} from '../../index.js';

describe('P3-E10-T08 Closeout consumption contract stability', () => {
  describe('CloseoutDataClass', () => {
    it('has exactly 3 data classes per §1', () => { expect(CLOSEOUT_DATA_CLASSES).toHaveLength(3); });
  });

  describe('CloseoutOrgIndex', () => {
    it('has exactly 3 org indexes per §2', () => { expect(CLOSEOUT_ORG_INDEXES).toHaveLength(3); });
  });

  describe('CloseoutHealthSpineDimension', () => {
    it('has exactly 4 dimensions per §5.2', () => { expect(CLOSEOUT_HEALTH_SPINE_DIMENSIONS).toHaveLength(4); });
  });

  describe('Data class definitions', () => {
    it('has exactly 3 rows per §1', () => { expect(CLOSEOUT_DATA_CLASS_DEFINITIONS).toHaveLength(3); });
    it('each has all fields', () => {
      for (const def of CLOSEOUT_DATA_CLASS_DEFINITIONS) {
        expect(def.class).toBeTruthy();
        expect(def.data).toBeTruthy();
        expect(def.writePath).toBeTruthy();
        expect(def.readPath).toBeTruthy();
      }
    });
  });

  describe('Org index definitions', () => {
    it('has exactly 3 per §2', () => { expect(CLOSEOUT_ORG_INDEX_DEFINITIONS).toHaveLength(3); });
  });

  describe('Search dimensions', () => {
    it('has 3 per §2.1–2.3', () => { expect(CLOSEOUT_SEARCH_DIMENSIONS).toHaveLength(3); });
    it('each index has search fields defined', () => {
      for (const dim of CLOSEOUT_SEARCH_DIMENSIONS) {
        expect(dim.fullTextFields.length).toBeGreaterThan(0);
        expect(dim.filterFields.length).toBeGreaterThan(0);
        expect(dim.sortFields.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Consumption surfaces', () => {
    it('has exactly 3 per §3', () => { expect(CLOSEOUT_CONSUMPTION_SURFACES).toHaveLength(3); });
  });

  describe('Activity spine events', () => {
    it('has exactly 17 events per §5.1', () => { expect(CLOSEOUT_ACTIVITY_SPINE_EVENTS).toHaveLength(17); });
    it('each has eventKey, trigger, payload', () => {
      for (const e of CLOSEOUT_ACTIVITY_SPINE_EVENTS) {
        expect(e.eventKey).toBeTruthy();
        expect(e.trigger).toBeTruthy();
        expect(e.payloadDescription).toBeTruthy();
      }
    });
    it('all event keys start with closeout.', () => {
      expect(CLOSEOUT_ACTIVITY_SPINE_EVENTS.every((e) => e.eventKey.startsWith('closeout.'))).toBe(true);
    });
  });

  describe('Health spine metrics', () => {
    it('has exactly 4 per §5.2', () => { expect(CLOSEOUT_HEALTH_SPINE_METRICS).toHaveLength(4); });
  });

  describe('Report artifact families', () => {
    it('has exactly 2 per §6.1', () => { expect(CLOSEOUT_REPORT_ARTIFACT_FAMILIES).toHaveLength(2); });
  });

  describe('Snapshot preconditions', () => {
    it('has exactly 2 per §6.2', () => { expect(CLOSEOUT_SNAPSHOT_PRECONDITIONS).toHaveLength(2); });
  });

  describe('UI data class rules', () => {
    it('has exactly 7 per §4', () => { expect(CLOSEOUT_UI_DATA_CLASS_RULES).toHaveLength(7); });
  });

  describe('Label maps', () => {
    it('labels all 3 data classes', () => { expect(Object.keys(CLOSEOUT_DATA_CLASS_LABELS)).toHaveLength(3); });
    it('labels all 3 org indexes', () => { expect(Object.keys(CLOSEOUT_ORG_INDEX_LABELS)).toHaveLength(3); });
    it('labels all 4 health dimensions', () => { expect(Object.keys(CLOSEOUT_HEALTH_SPINE_DIMENSION_LABELS)).toHaveLength(4); });
  });
});
