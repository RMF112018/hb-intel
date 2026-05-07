import { expect, test } from '@playwright/test';
import { REQUIRED_PCC_EVIDENCE_IDS, type PccEvidenceRecord } from './pcc-evidence.types';
import { PCC_EVIDENCE_REGISTRY } from './pcc-evidence.registry';
import {
  PCC_HARD_STOPS,
  PCC_SCORECARD_PILLARS,
  getPccHardStopById,
  getPccScorecardPillarById,
  getPccTotalScorecardWeight,
} from './pcc-scorecard.model';
import {
  buildPccEvidenceScorecardMap,
  buildPccHardStopEvidenceMap,
  buildPccHardStopWorksheet,
  buildPccPillarEvidenceMap,
  buildPccScorecardWorksheet,
  getPccScorecardTraceabilityCoverage,
} from './pcc-scorecard.traceability';
import { PCC_HARD_STOP_IDS, PCC_SCORECARD_PILLAR_IDS } from './pcc-scorecard.types';

test('pillar model has exact IDs, required metadata, and total weight 100', () => {
  expect(PCC_SCORECARD_PILLARS).toHaveLength(9);
  expect(PCC_SCORECARD_PILLARS.map((p) => p.id)).toEqual(PCC_SCORECARD_PILLAR_IDS);
  expect(getPccTotalScorecardWeight()).toBe(100);

  for (const pillar of PCC_SCORECARD_PILLARS) {
    expect(pillar.title.length).toBeGreaterThan(0);
    expect(pillar.purpose.length).toBeGreaterThan(0);
    expect(pillar.sourceRefs.length).toBeGreaterThan(0);
    expect(pillar.manualScoringRequired).toBe(true);
    expect(getPccScorecardPillarById(pillar.id)?.id).toBe(pillar.id);
  }
});

test('hard-stop model has exact IDs and blocking/manual-review posture', () => {
  expect(PCC_HARD_STOPS).toHaveLength(10);
  expect(PCC_HARD_STOPS.map((h) => h.id)).toEqual(PCC_HARD_STOP_IDS);

  for (const hardStop of PCC_HARD_STOPS) {
    expect(hardStop.title.length).toBeGreaterThan(0);
    expect(hardStop.failure.length).toBeGreaterThan(0);
    expect(hardStop.sourceRefs.length).toBeGreaterThan(0);
    expect(hardStop.blocksPhase4).toBe(true);
    expect(hardStop.manualReviewRequired).toBe(true);
    expect(getPccHardStopById(hardStop.id)?.id).toBe(hardStop.id);
  }
});

test('pillar and hard-stop evidence maps include all keys with at least one EV', () => {
  const pillarMap = buildPccPillarEvidenceMap(PCC_EVIDENCE_REGISTRY);
  const hardStopMap = buildPccHardStopEvidenceMap(PCC_EVIDENCE_REGISTRY);

  expect(Object.keys(pillarMap).sort()).toEqual([...PCC_SCORECARD_PILLAR_IDS].sort());
  expect(Object.keys(hardStopMap).sort()).toEqual([...PCC_HARD_STOP_IDS].sort());

  for (const pillarId of PCC_SCORECARD_PILLAR_IDS) {
    expect(pillarMap[pillarId].length).toBeGreaterThan(0);
  }

  for (const hardStopId of PCC_HARD_STOP_IDS) {
    expect(hardStopMap[hardStopId].length).toBeGreaterThan(0);
  }
});

test('evidence-to-scorecard map includes all 80 EV IDs with known refs only', () => {
  const map = buildPccEvidenceScorecardMap(PCC_EVIDENCE_REGISTRY);

  expect(Object.keys(map).sort()).toEqual([...REQUIRED_PCC_EVIDENCE_IDS].sort());

  for (const id of REQUIRED_PCC_EVIDENCE_IDS) {
    const entry = map[id];
    expect(entry.evidenceId).toBe(id);
    for (const pillar of entry.pillarRefs) {
      expect(PCC_SCORECARD_PILLAR_IDS.includes(pillar)).toBe(true);
    }
    for (const hardStop of entry.hardStopRefs) {
      expect(PCC_HARD_STOP_IDS.includes(hardStop)).toBe(true);
    }
  }
});

test('worksheets are manual-only placeholders and do not default to score or pass/fail', () => {
  const scorecardRows = buildPccScorecardWorksheet(PCC_EVIDENCE_REGISTRY);
  const hardStopRows = buildPccHardStopWorksheet(PCC_EVIDENCE_REGISTRY);

  expect(scorecardRows).toHaveLength(9);
  for (const row of scorecardRows) {
    expect(row.manualScore).toBeNull();
    expect(row.automatedScore).toBeNull();
    expect(row.scoringOwner).toBe('expert-review');
    expect(typeof row.manualScore).not.toBe('number');
    expect(typeof row.automatedScore).not.toBe('number');
  }

  expect(hardStopRows).toHaveLength(10);
  for (const row of hardStopRows) {
    expect(row.reviewStatus).toBe('manual-review-required');
    expect(row.reviewStatus).not.toBe('passed');
    expect(row.reviewStatus).not.toBe('failed');
  }
});

test('traceability coverage reports complete coverage for canonical registry', () => {
  const coverage = getPccScorecardTraceabilityCoverage(PCC_EVIDENCE_REGISTRY);

  expect(coverage.expectedEvidenceCount).toBe(80);
  expect(coverage.coveredEvidenceCount).toBe(80);
  expect(coverage.missingEvidenceIds).toEqual([]);
  expect(coverage.missingPillars).toEqual([]);
  expect(coverage.missingHardStops).toEqual([]);
  expect(coverage.unknownPillarRefs).toEqual([]);
  expect(coverage.unknownHardStopRefs).toEqual([]);
  expect(coverage.unknownEvidenceIds).toEqual([]);
});

test('coverage flags unknown pillar refs in malformed records', () => {
  const malformed = [
    ...PCC_EVIDENCE_REGISTRY,
    {
      ...PCC_EVIDENCE_REGISTRY[0],
      pillarRefs: ['P1', 'P99'] as unknown as PccEvidenceRecord['pillarRefs'],
    },
  ] as unknown as PccEvidenceRecord[];

  const coverage = getPccScorecardTraceabilityCoverage(malformed);
  expect(coverage.unknownPillarRefs).toContain('P99');
});

test('coverage flags unknown hard-stop refs in malformed records', () => {
  const malformed = [
    ...PCC_EVIDENCE_REGISTRY,
    {
      ...PCC_EVIDENCE_REGISTRY[0],
      hardStopRefs: ['HS-01', 'HS-99'] as unknown as PccEvidenceRecord['hardStopRefs'],
    },
  ] as unknown as PccEvidenceRecord[];

  const coverage = getPccScorecardTraceabilityCoverage(malformed);
  expect(coverage.unknownHardStopRefs).toContain('HS-99');
});

test('coverage flags unknown EV IDs in malformed records', () => {
  const malformed = [
    ...PCC_EVIDENCE_REGISTRY,
    {
      ...PCC_EVIDENCE_REGISTRY[0],
      id: 'EV-999' as unknown as PccEvidenceRecord['id'],
    },
  ] as unknown as PccEvidenceRecord[];

  const coverage = getPccScorecardTraceabilityCoverage(malformed);
  expect(coverage.unknownEvidenceIds).toContain('EV-999');
});

test('coverage flags missing pillar coverage', () => {
  const malformed = PCC_EVIDENCE_REGISTRY.map((record) => ({
    ...record,
    pillarRefs: record.pillarRefs.filter((pillar) => pillar !== 'P8'),
  })) as unknown as PccEvidenceRecord[];

  const coverage = getPccScorecardTraceabilityCoverage(malformed);
  expect(coverage.missingPillars).toContain('P8');
});

test('coverage flags missing hard-stop coverage', () => {
  const malformed = PCC_EVIDENCE_REGISTRY.map((record) => ({
    ...record,
    hardStopRefs: record.hardStopRefs.filter((hardStop) => hardStop !== 'HS-07'),
  })) as unknown as PccEvidenceRecord[];

  const coverage = getPccScorecardTraceabilityCoverage(malformed);
  expect(coverage.missingHardStops).toContain('HS-07');
});
