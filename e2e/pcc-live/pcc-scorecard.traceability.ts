import {
  REQUIRED_PCC_EVIDENCE_IDS,
  type PccEvidenceId,
  type PccEvidenceRecord,
} from './pcc-evidence.types';
import { PCC_HARD_STOPS, PCC_SCORECARD_PILLARS } from './pcc-scorecard.model';
import {
  type PccEvidenceScorecardMap,
  type PccHardStopEvidenceMap,
  type PccHardStopWorksheetRow,
  type PccPillarEvidenceMap,
  type PccScorecardTraceabilityCoverage,
  type PccScorecardWorksheetRow,
  PCC_HARD_STOP_IDS,
  PCC_SCORECARD_PILLAR_IDS,
} from './pcc-scorecard.types';

const PILLAR_SET = new Set<string>(PCC_SCORECARD_PILLAR_IDS);
const HARD_STOP_SET = new Set<string>(PCC_HARD_STOP_IDS);
const EVIDENCE_SET = new Set<string>(REQUIRED_PCC_EVIDENCE_IDS);

function asEvidenceId(id: string): PccEvidenceId {
  return id as PccEvidenceId;
}

function sortEvidenceIds(ids: readonly PccEvidenceId[]): PccEvidenceId[] {
  return [...ids].sort((a, b) => Number(a.replace('EV-', '')) - Number(b.replace('EV-', '')));
}

export function buildPccPillarEvidenceMap(
  registry: readonly PccEvidenceRecord[],
): PccPillarEvidenceMap {
  const map = Object.fromEntries(
    PCC_SCORECARD_PILLAR_IDS.map((id) => [id, [] as PccEvidenceId[]]),
  ) as PccPillarEvidenceMap;

  for (const record of registry) {
    for (const pillar of record.pillarRefs) {
      if (!PILLAR_SET.has(pillar)) continue;
      if (!map[pillar].includes(record.id)) map[pillar].push(record.id);
    }
  }

  for (const pillar of PCC_SCORECARD_PILLAR_IDS) {
    map[pillar] = sortEvidenceIds(map[pillar]);
  }

  return map;
}

export function buildPccHardStopEvidenceMap(
  registry: readonly PccEvidenceRecord[],
): PccHardStopEvidenceMap {
  const map = Object.fromEntries(
    PCC_HARD_STOP_IDS.map((id) => [id, [] as PccEvidenceId[]]),
  ) as PccHardStopEvidenceMap;

  for (const record of registry) {
    for (const hardStop of record.hardStopRefs) {
      if (!HARD_STOP_SET.has(hardStop)) continue;
      if (!map[hardStop].includes(record.id)) map[hardStop].push(record.id);
    }
  }

  for (const hardStop of PCC_HARD_STOP_IDS) {
    map[hardStop] = sortEvidenceIds(map[hardStop]);
  }

  return map;
}

export function buildPccEvidenceScorecardMap(
  registry: readonly PccEvidenceRecord[],
): PccEvidenceScorecardMap {
  const map = {} as PccEvidenceScorecardMap;

  for (const id of REQUIRED_PCC_EVIDENCE_IDS) {
    map[id] = {
      evidenceId: id,
      pillarRefs: [],
      hardStopRefs: [],
    };
  }

  for (const record of registry) {
    if (!EVIDENCE_SET.has(record.id)) continue;

    map[record.id] = {
      evidenceId: record.id,
      pillarRefs: record.pillarRefs.filter((p) => PILLAR_SET.has(p)),
      hardStopRefs: record.hardStopRefs.filter((h) => HARD_STOP_SET.has(h)),
    };
  }

  return map;
}

export function buildPccScorecardWorksheet(
  registry: readonly PccEvidenceRecord[],
): PccScorecardWorksheetRow[] {
  const pillarMap = buildPccPillarEvidenceMap(registry);

  return PCC_SCORECARD_PILLARS.map((pillar) => ({
    pillarId: pillar.id,
    title: pillar.title,
    weight: pillar.weight,
    manualScore: null,
    automatedScore: null,
    scoringOwner: 'expert-review',
    evidenceIds: pillarMap[pillar.id],
    notes: '',
  }));
}

export function buildPccHardStopWorksheet(
  registry: readonly PccEvidenceRecord[],
): PccHardStopWorksheetRow[] {
  const hardStopMap = buildPccHardStopEvidenceMap(registry);

  return PCC_HARD_STOPS.map((hardStop) => ({
    hardStopId: hardStop.id,
    title: hardStop.title,
    blocksPhase4: true,
    reviewStatus: 'manual-review-required',
    evidenceIds: hardStopMap[hardStop.id],
    notes: '',
  }));
}

export function getPccScorecardTraceabilityCoverage(
  registry: readonly PccEvidenceRecord[],
): PccScorecardTraceabilityCoverage {
  const pillarMap = buildPccPillarEvidenceMap(registry);
  const hardStopMap = buildPccHardStopEvidenceMap(registry);

  const unknownPillarRefs = new Set<string>();
  const unknownHardStopRefs = new Set<string>();
  const unknownEvidenceIds = new Set<string>();

  for (const record of registry) {
    if (!EVIDENCE_SET.has(record.id)) unknownEvidenceIds.add(record.id);

    for (const pillar of record.pillarRefs) {
      if (!PILLAR_SET.has(pillar)) unknownPillarRefs.add(pillar);
    }

    for (const hardStop of record.hardStopRefs) {
      if (!HARD_STOP_SET.has(hardStop)) unknownHardStopRefs.add(hardStop);
    }
  }

  const missingPillars = PCC_SCORECARD_PILLAR_IDS.filter(
    (pillar) => pillarMap[pillar].length === 0,
  );
  const missingHardStops = PCC_HARD_STOP_IDS.filter(
    (hardStop) => hardStopMap[hardStop].length === 0,
  );

  const coveredEvidence = new Set<PccEvidenceId>();
  for (const ids of Object.values(pillarMap)) {
    for (const id of ids) coveredEvidence.add(id);
  }

  const missingEvidenceIds = REQUIRED_PCC_EVIDENCE_IDS.filter((id) => !coveredEvidence.has(id));

  for (const unknownId of unknownEvidenceIds) {
    missingEvidenceIds.push(asEvidenceId(unknownId));
  }

  return {
    expectedEvidenceCount: REQUIRED_PCC_EVIDENCE_IDS.length,
    coveredEvidenceCount: coveredEvidence.size,
    missingEvidenceIds: sortEvidenceIds([...new Set(missingEvidenceIds)]),
    missingPillars,
    missingHardStops,
    unknownPillarRefs: [...unknownPillarRefs].sort(),
    unknownHardStopRefs: [...unknownHardStopRefs].sort(),
    unknownEvidenceIds: [...unknownEvidenceIds].sort(),
  };
}
