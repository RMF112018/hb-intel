/**
 * P3-J1 E8 document-readiness-spikes contract and business-rule tests.
 */
import { describe, expect, it } from 'vitest';

import {
  // Enum arrays
  SPIKE_FINDING_AREA_VALUES,
  DOCUMENT_TELEMETRY_EVENT_VALUES,
  CONTRADICTION_SEVERITY_VALUES,
  PHASE_5_HANDOFF_STATUS_VALUES,
  // Label maps
  SPIKE_FINDING_AREA_LABELS,
  CONTRADICTION_SEVERITY_LABELS,
  PHASE_5_HANDOFF_STATUS_LABELS,
  // Constants
  SPIKE_FINDING_AREAS,
  TELEMETRY_EVENT_DEFINITIONS,
  PHASE_5_HANDOFF_RECOMMENDATIONS,
  CONTRADICTION_REGISTER_TEMPLATE,
  // Business rules
  areBiggestUnknownsReduced,
  areProjectContextAssumptionsSurfaced,
  isTelemetryEventDefined,
  getSpikeFindingForArea,
  getContradictionSeverityCount,
  isPhase5HandoffReady,
  isContradictionRegisterPopulated,
  canPhase5ProceedWithoutRework,
  // Types (compile-time checks)
  type ISpikeFindingMemo,
  type IContradictionRegisterEntry,
  type ITelemetryEventDefinition,
  type IPhase5HandoffRecommendation,
} from '../index.js';

// -- Contract stability -----------------------------------------------------------

describe('document-readiness-spikes contract stability', () => {
  it('SPIKE_FINDING_AREA_VALUES has 4 members', () => {
    expect(SPIKE_FINDING_AREA_VALUES).toHaveLength(4);
  });

  it('DOCUMENT_TELEMETRY_EVENT_VALUES has 5 members', () => {
    expect(DOCUMENT_TELEMETRY_EVENT_VALUES).toHaveLength(5);
  });

  it('CONTRADICTION_SEVERITY_VALUES has 4 members', () => {
    expect(CONTRADICTION_SEVERITY_VALUES).toHaveLength(4);
  });

  it('PHASE_5_HANDOFF_STATUS_VALUES has 4 members', () => {
    expect(PHASE_5_HANDOFF_STATUS_VALUES).toHaveLength(4);
  });

  it('SPIKE_FINDING_AREA_LABELS has 4 keys', () => {
    expect(Object.keys(SPIKE_FINDING_AREA_LABELS)).toHaveLength(4);
  });

  it('CONTRADICTION_SEVERITY_LABELS has 4 keys', () => {
    expect(Object.keys(CONTRADICTION_SEVERITY_LABELS)).toHaveLength(4);
  });

  it('PHASE_5_HANDOFF_STATUS_LABELS has 4 keys', () => {
    expect(Object.keys(PHASE_5_HANDOFF_STATUS_LABELS)).toHaveLength(4);
  });

  it('SPIKE_FINDING_AREAS has 4 entries', () => {
    expect(SPIKE_FINDING_AREAS).toHaveLength(4);
  });

  it('SPIKE_FINDING_AREAS covers all 4 spike areas', () => {
    const areas = SPIKE_FINDING_AREAS.map((e) => e.area);
    expect(areas).toEqual(expect.arrayContaining([...SPIKE_FINDING_AREA_VALUES]));
  });

  it('all SPIKE_FINDING_AREAS have no blockers identified', () => {
    expect(SPIKE_FINDING_AREAS.every((e) => e.blockerIdentified === false)).toBe(true);
  });

  it('all SPIKE_FINDING_AREAS have non-empty findings', () => {
    expect(SPIKE_FINDING_AREAS.every((e) => e.finding.length > 0)).toBe(true);
  });

  it('all SPIKE_FINDING_AREAS have non-empty recommendations', () => {
    expect(SPIKE_FINDING_AREAS.every((e) => e.recommendation.length > 0)).toBe(true);
  });

  it('TELEMETRY_EVENT_DEFINITIONS has 5 entries', () => {
    expect(TELEMETRY_EVENT_DEFINITIONS).toHaveLength(5);
  });

  it('TELEMETRY_EVENT_DEFINITIONS covers all 5 events', () => {
    const events = TELEMETRY_EVENT_DEFINITIONS.map((e) => e.event);
    expect(events).toEqual(expect.arrayContaining([...DOCUMENT_TELEMETRY_EVENT_VALUES]));
  });

  it('all TELEMETRY_EVENT_DEFINITIONS have non-empty descriptions', () => {
    expect(TELEMETRY_EVENT_DEFINITIONS.every((e) => e.description.length > 0)).toBe(true);
  });

  it('all TELEMETRY_EVENT_DEFINITIONS have non-empty dataPayload', () => {
    expect(TELEMETRY_EVENT_DEFINITIONS.every((e) => e.dataPayload.length > 0)).toBe(true);
  });

  it('PHASE_5_HANDOFF_RECOMMENDATIONS has 4 entries', () => {
    expect(PHASE_5_HANDOFF_RECOMMENDATIONS).toHaveLength(4);
  });

  it('PHASE_5_HANDOFF_RECOMMENDATIONS covers all 4 spike areas', () => {
    const areas = PHASE_5_HANDOFF_RECOMMENDATIONS.map((r) => r.area);
    expect(areas).toEqual(expect.arrayContaining([...SPIKE_FINDING_AREA_VALUES]));
  });

  it('all PHASE_5_HANDOFF_RECOMMENDATIONS have RECOMMENDED status', () => {
    expect(PHASE_5_HANDOFF_RECOMMENDATIONS.every((r) => r.status === 'RECOMMENDED')).toBe(true);
  });

  it('all PHASE_5_HANDOFF_RECOMMENDATIONS have non-empty prerequisites', () => {
    expect(PHASE_5_HANDOFF_RECOMMENDATIONS.every((r) => r.prerequisitesRequired.length > 0)).toBe(true);
  });

  it('all PHASE_5_HANDOFF_RECOMMENDATIONS have non-empty riskIfIgnored', () => {
    expect(PHASE_5_HANDOFF_RECOMMENDATIONS.every((r) => r.riskIfIgnored.length > 0)).toBe(true);
  });

  it('CONTRADICTION_REGISTER_TEMPLATE is empty', () => {
    expect(CONTRADICTION_REGISTER_TEMPLATE).toHaveLength(0);
  });

  // Type-level compile checks (no runtime assertion needed)
  it('type contracts compile correctly', () => {
    const _spikeMemo: ISpikeFindingMemo = SPIKE_FINDING_AREAS[0]!;
    const _telemetryDef: ITelemetryEventDefinition = TELEMETRY_EVENT_DEFINITIONS[0]!;
    const _handoffRec: IPhase5HandoffRecommendation = PHASE_5_HANDOFF_RECOMMENDATIONS[0]!;
    const _contradictionEntry: IContradictionRegisterEntry = {
      entryId: 'test-entry',
      area: 'REGISTRY_RESOLUTION',
      contradiction: 'Test contradiction',
      severity: 'MINOR',
      impactOnPhase5: 'None',
      resolutionAction: 'No action needed',
    };

    expect(_spikeMemo).toBeDefined();
    expect(_telemetryDef).toBeDefined();
    expect(_handoffRec).toBeDefined();
    expect(_contradictionEntry).toBeDefined();
  });
});

// -- Business rules ---------------------------------------------------------------

describe('document-readiness-spikes business rules', () => {
  describe('areBiggestUnknownsReduced', () => {
    it('returns true', () => {
      expect(areBiggestUnknownsReduced()).toBe(true);
    });
  });

  describe('areProjectContextAssumptionsSurfaced', () => {
    it('returns true', () => {
      expect(areProjectContextAssumptionsSurfaced()).toBe(true);
    });
  });

  describe('isTelemetryEventDefined', () => {
    it('returns true for LAUNCH', () => {
      expect(isTelemetryEventDefined('LAUNCH')).toBe(true);
    });

    it('returns true for PREVIEW', () => {
      expect(isTelemetryEventDefined('PREVIEW')).toBe(true);
    });

    it('returns true for RAW_FALLBACK', () => {
      expect(isTelemetryEventDefined('RAW_FALLBACK')).toBe(true);
    });

    it('returns true for RESTRICTED_STUB_EXPOSURE', () => {
      expect(isTelemetryEventDefined('RESTRICTED_STUB_EXPOSURE')).toBe(true);
    });

    it('returns true for NO_ACCESS_STATE', () => {
      expect(isTelemetryEventDefined('NO_ACCESS_STATE')).toBe(true);
    });

    it('returns false for unknown event', () => {
      expect(isTelemetryEventDefined('UNKNOWN' as never)).toBe(false);
    });
  });

  describe('getSpikeFindingForArea', () => {
    it('returns finding for REGISTRY_RESOLUTION', () => {
      const result = getSpikeFindingForArea('REGISTRY_RESOLUTION');
      expect(result).not.toBeNull();
      expect(result?.area).toBe('REGISTRY_RESOLUTION');
    });

    it('returns finding for AUTH_TOKEN_FLOW', () => {
      const result = getSpikeFindingForArea('AUTH_TOKEN_FLOW');
      expect(result).not.toBeNull();
      expect(result?.area).toBe('AUTH_TOKEN_FLOW');
    });

    it('returns finding for PREVIEW_FEASIBILITY', () => {
      const result = getSpikeFindingForArea('PREVIEW_FEASIBILITY');
      expect(result).not.toBeNull();
      expect(result?.area).toBe('PREVIEW_FEASIBILITY');
    });

    it('returns finding for HANDOFF_MECHANICS', () => {
      const result = getSpikeFindingForArea('HANDOFF_MECHANICS');
      expect(result).not.toBeNull();
      expect(result?.area).toBe('HANDOFF_MECHANICS');
    });

    it('returns null for unknown area', () => {
      expect(getSpikeFindingForArea('UNKNOWN' as never)).toBeNull();
    });
  });

  describe('getContradictionSeverityCount', () => {
    const testEntries: ReadonlyArray<IContradictionRegisterEntry> = [
      { entryId: '1', area: 'REGISTRY_RESOLUTION', contradiction: 'C1', severity: 'BLOCKING', impactOnPhase5: 'High', resolutionAction: 'Fix' },
      { entryId: '2', area: 'AUTH_TOKEN_FLOW', contradiction: 'C2', severity: 'BLOCKING', impactOnPhase5: 'High', resolutionAction: 'Fix' },
      { entryId: '3', area: 'PREVIEW_FEASIBILITY', contradiction: 'C3', severity: 'MINOR', impactOnPhase5: 'Low', resolutionAction: 'Monitor' },
    ];

    it('counts BLOCKING entries correctly', () => {
      expect(getContradictionSeverityCount(testEntries, 'BLOCKING')).toBe(2);
    });

    it('counts MINOR entries correctly', () => {
      expect(getContradictionSeverityCount(testEntries, 'MINOR')).toBe(1);
    });

    it('returns 0 for severity with no entries', () => {
      expect(getContradictionSeverityCount(testEntries, 'INFORMATIONAL')).toBe(0);
    });

    it('returns 0 for empty array', () => {
      expect(getContradictionSeverityCount([], 'BLOCKING')).toBe(0);
    });
  });

  describe('isPhase5HandoffReady', () => {
    it('returns true for REGISTRY_RESOLUTION', () => {
      expect(isPhase5HandoffReady('REGISTRY_RESOLUTION')).toBe(true);
    });

    it('returns true for AUTH_TOKEN_FLOW', () => {
      expect(isPhase5HandoffReady('AUTH_TOKEN_FLOW')).toBe(true);
    });

    it('returns true for PREVIEW_FEASIBILITY', () => {
      expect(isPhase5HandoffReady('PREVIEW_FEASIBILITY')).toBe(true);
    });

    it('returns true for HANDOFF_MECHANICS', () => {
      expect(isPhase5HandoffReady('HANDOFF_MECHANICS')).toBe(true);
    });

    it('returns false for unknown area', () => {
      expect(isPhase5HandoffReady('UNKNOWN' as never)).toBe(false);
    });
  });

  describe('isContradictionRegisterPopulated', () => {
    it('returns true', () => {
      expect(isContradictionRegisterPopulated()).toBe(true);
    });
  });

  describe('canPhase5ProceedWithoutRework', () => {
    it('returns true', () => {
      expect(canPhase5ProceedWithoutRework()).toBe(true);
    });
  });
});
