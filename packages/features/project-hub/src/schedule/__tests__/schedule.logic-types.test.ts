import { describe, expect, it } from 'vitest';

import {
  LOGIC_LAYERS,
  LOGIC_RELATIONSHIP_TYPES,
  LOGIC_SOURCES,
  PROPAGATION_RULES,
  PROPAGATION_TYPES,
  WORK_PACKAGE_LINK_TYPES,
} from '../constants/index.js';

describe('P3-E5-T06 contract stability', () => {
  it('has 3 logic layers', () => {
    expect(LOGIC_LAYERS).toHaveLength(3);
    expect(LOGIC_LAYERS).toEqual(['SourceCPM', 'Scenario', 'WorkPackage']);
  });

  it('has 4 logic relationship types', () => {
    expect(LOGIC_RELATIONSHIP_TYPES).toHaveLength(4);
    expect(LOGIC_RELATIONSHIP_TYPES).toEqual(['FS', 'SS', 'FF', 'SF']);
  });

  it('has 3 logic sources', () => {
    expect(LOGIC_SOURCES).toHaveLength(3);
    expect(LOGIC_SOURCES).toEqual(['SourceCPM', 'ScenarioOverride', 'WorkPackageLink']);
  });

  it('has 4 work package link types', () => {
    expect(WORK_PACKAGE_LINK_TYPES).toHaveLength(4);
  });

  it('has 3 propagation types', () => {
    expect(PROPAGATION_TYPES).toHaveLength(3);
    expect(PROPAGATION_TYPES).toEqual([
      'SourceSchedulePropagated', 'OperatingLayerProjected', 'ScenarioLayerProjected',
    ]);
  });

  it('has 3 propagation rules matching types', () => {
    expect(PROPAGATION_RULES).toHaveLength(3);
    for (const type of PROPAGATION_TYPES) {
      expect(PROPAGATION_RULES.find((r) => r.propagationType === type)).toBeDefined();
    }
  });
});
