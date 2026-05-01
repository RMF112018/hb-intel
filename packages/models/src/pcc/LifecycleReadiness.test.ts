import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  LIFECYCLE_READINESS_CRITICALITY_LEVELS,
  LIFECYCLE_READINESS_DOMAINS,
  LIFECYCLE_READINESS_EVIDENCE_POLICIES,
  LIFECYCLE_READINESS_EXCEPTION_CODES,
  LIFECYCLE_READINESS_EXTERNAL_REFERENCE_SYSTEMS,
  LIFECYCLE_READINESS_FAMILIES,
  LIFECYCLE_READINESS_GATES,
  LIFECYCLE_READINESS_ITEM_TYPES,
  LIFECYCLE_READINESS_LIBRARY_FAMILY_COUNTS,
  LIFECYCLE_READINESS_LIBRARY_TOTAL,
  LIFECYCLE_READINESS_OWNERSHIP_CLASSIFICATIONS,
  LIFECYCLE_READINESS_PHASES,
  LIFECYCLE_READINESS_RECURRENCE_CADENCES,
  LIFECYCLE_READINESS_STATUSES,
  PCC_PERSONAS,
  PROJECT_READINESS_BLOCKER_STATES,
  PROJECT_READINESS_CONFIDENCE_STATES,
  PROJECT_READINESS_EVIDENCE_STATES,
  PROJECT_READINESS_POSTURES,
  PROJECT_READINESS_SEVERITIES,
  PROJECT_READINESS_STATUSES,
  type PccPersona,
} from './index.js';
import {
  LIFECYCLE_READINESS_LIBRARY_METADATA,
  SAMPLE_LIFECYCLE_READINESS_BLOCKER_SUMMARY,
  SAMPLE_LIFECYCLE_READINESS_DOMAIN_SUMMARIES,
  SAMPLE_LIFECYCLE_READINESS_EVIDENCE_SUMMARY,
  SAMPLE_LIFECYCLE_READINESS_GATE_SUMMARIES,
  SAMPLE_LIFECYCLE_READINESS_PHASE_SUMMARIES,
  SAMPLE_LIFECYCLE_READINESS_PROJECT_ITEMS,
  SAMPLE_LIFECYCLE_READINESS_READ_MODEL,
  SAMPLE_LIFECYCLE_READINESS_READ_MODEL_ALIAS,
  SAMPLE_LIFECYCLE_READINESS_SUMMARY,
  SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS,
} from './fixtures/lifecycleReadiness.js';

const PERSONA_SET: ReadonlySet<PccPersona> = new Set(PCC_PERSONAS);

function strip(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/gm, ' ')
    .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, ' ')
    .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, ' ')
    .replace(/`[^`\\]*(?:\\.[^`\\]*)*`/g, ' ');
}

const FORBIDDEN_IMPORT_PATTERNS: readonly RegExp[] = [
  /\b@microsoft\/sp-/,
  /\b@pnp\//,
  /\b@azure\//,
  /\baxios\b/,
  /\bnode-fetch\b/,
  /procore-sdk/i,
  /\.\.\/\.\.\/\.\.\/backend\//,
  /\b@hbc\/project-site-provisioning\b/,
  /\b@hbc\/project-site-template\b/,
  /\b@hbc\/functions\b/,
];

const FRAMEWORK_FILE = fileURLToPath(
  new URL('./LifecycleReadiness.ts', import.meta.url),
);
const FIXTURE_FILE = fileURLToPath(
  new URL('./fixtures/lifecycleReadiness.ts', import.meta.url),
);

describe('Lifecycle readiness vocabularies', () => {
  it('every constant tuple is non-empty and unique', () => {
    const tuples: ReadonlyArray<readonly [string, readonly string[]]> = [
      ['LIFECYCLE_READINESS_FAMILIES', LIFECYCLE_READINESS_FAMILIES],
      ['LIFECYCLE_READINESS_PHASES', LIFECYCLE_READINESS_PHASES],
      ['LIFECYCLE_READINESS_DOMAINS', LIFECYCLE_READINESS_DOMAINS],
      ['LIFECYCLE_READINESS_ITEM_TYPES', LIFECYCLE_READINESS_ITEM_TYPES],
      [
        'LIFECYCLE_READINESS_CRITICALITY_LEVELS',
        LIFECYCLE_READINESS_CRITICALITY_LEVELS,
      ],
      ['LIFECYCLE_READINESS_STATUSES', LIFECYCLE_READINESS_STATUSES],
      [
        'LIFECYCLE_READINESS_EXCEPTION_CODES',
        LIFECYCLE_READINESS_EXCEPTION_CODES,
      ],
      ['LIFECYCLE_READINESS_GATES', LIFECYCLE_READINESS_GATES],
      [
        'LIFECYCLE_READINESS_EVIDENCE_POLICIES',
        LIFECYCLE_READINESS_EVIDENCE_POLICIES,
      ],
      [
        'LIFECYCLE_READINESS_OWNERSHIP_CLASSIFICATIONS',
        LIFECYCLE_READINESS_OWNERSHIP_CLASSIFICATIONS,
      ],
      [
        'LIFECYCLE_READINESS_EXTERNAL_REFERENCE_SYSTEMS',
        LIFECYCLE_READINESS_EXTERNAL_REFERENCE_SYSTEMS,
      ],
      [
        'LIFECYCLE_READINESS_RECURRENCE_CADENCES',
        LIFECYCLE_READINESS_RECURRENCE_CADENCES,
      ],
    ];
    for (const [name, tuple] of tuples) {
      expect(tuple.length, `${name} should be non-empty`).toBeGreaterThan(0);
      expect(new Set(tuple).size, `${name} should have unique values`).toBe(
        tuple.length,
      );
    }
  });

  it('locks the canonical Wave 9 taxonomy counts', () => {
    expect(LIFECYCLE_READINESS_FAMILIES.length).toBe(3);
    expect(LIFECYCLE_READINESS_PHASES.length).toBe(10);
    expect(LIFECYCLE_READINESS_DOMAINS.length).toBe(12);
    expect(LIFECYCLE_READINESS_ITEM_TYPES.length).toBe(10);
    expect(LIFECYCLE_READINESS_CRITICALITY_LEVELS.length).toBe(5);
    expect(LIFECYCLE_READINESS_STATUSES.length).toBe(12);
    expect(LIFECYCLE_READINESS_EXCEPTION_CODES.length).toBe(10);
    expect(LIFECYCLE_READINESS_GATES.length).toBe(9);
    expect(LIFECYCLE_READINESS_EVIDENCE_POLICIES.length).toBe(6);
    expect(LIFECYCLE_READINESS_OWNERSHIP_CLASSIFICATIONS.length).toBe(4);
    expect(LIFECYCLE_READINESS_EXTERNAL_REFERENCE_SYSTEMS.length).toBe(9);
    expect(LIFECYCLE_READINESS_RECURRENCE_CADENCES.length).toBe(5);
  });

  it('locks the canonical 157 / 55 / 32 / 70 source library cardinality', () => {
    expect(LIFECYCLE_READINESS_LIBRARY_TOTAL).toBe(157);
    expect(LIFECYCLE_READINESS_LIBRARY_FAMILY_COUNTS).toEqual({
      startup: 55,
      safety: 32,
      closeout: 70,
    });
    const sum =
      LIFECYCLE_READINESS_LIBRARY_FAMILY_COUNTS.startup +
      LIFECYCLE_READINESS_LIBRARY_FAMILY_COUNTS.safety +
      LIFECYCLE_READINESS_LIBRARY_FAMILY_COUNTS.closeout;
    expect(sum).toBe(LIFECYCLE_READINESS_LIBRARY_TOTAL);
  });

  it('Wave 9 statuses are structurally distinct from Wave 8 statuses', () => {
    expect(LIFECYCLE_READINESS_STATUSES.length).not.toBe(
      PROJECT_READINESS_STATUSES.length,
    );
    const wave9Members = new Set<string>(LIFECYCLE_READINESS_STATUSES);
    const wave8Only = (
      PROJECT_READINESS_STATUSES as readonly string[]
    ).filter((s) => !wave9Members.has(s));
    const wave9Only = LIFECYCLE_READINESS_STATUSES.filter(
      (s) => !(PROJECT_READINESS_STATUSES as readonly string[]).includes(s),
    );
    expect(wave8Only.length).toBeGreaterThan(0);
    expect(wave9Only.length).toBeGreaterThan(0);
  });
});

describe('SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS', () => {
  it('has ten templates with unique ids and one item per item-type', () => {
    expect(SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS.length).toBe(10);
    const ids = SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS.map(
      (t) => t.templateItemId,
    );
    expect(new Set(ids).size).toBe(ids.length);
    const itemTypes = SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS.map(
      (t) => t.itemType,
    );
    expect(new Set(itemTypes).size).toBe(LIFECYCLE_READINESS_ITEM_TYPES.length);
    for (const expected of LIFECYCLE_READINESS_ITEM_TYPES) {
      expect(itemTypes).toContain(expected);
    }
  });

  it('exercises every ownership classification and at least three criticality levels and evidence policies', () => {
    const ownershipUsed = new Set(
      SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS.map(
        (t) => t.ownershipClassification,
      ),
    );
    expect(ownershipUsed.size).toBe(
      LIFECYCLE_READINESS_OWNERSHIP_CLASSIFICATIONS.length,
    );
    const criticalityUsed = new Set(
      SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS.map((t) => t.criticality),
    );
    expect(criticalityUsed.size).toBeGreaterThanOrEqual(3);
    const policyUsed = new Set(
      SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS.map((t) => t.evidencePolicy),
    );
    expect(policyUsed.size).toBeGreaterThanOrEqual(3);
  });

  it('every enum-valued field uses values from the corresponding tuple', () => {
    const familySet = new Set<string>(LIFECYCLE_READINESS_FAMILIES);
    const phaseSet = new Set<string>(LIFECYCLE_READINESS_PHASES);
    const domainSet = new Set<string>(LIFECYCLE_READINESS_DOMAINS);
    const itemTypeSet = new Set<string>(LIFECYCLE_READINESS_ITEM_TYPES);
    const criticalitySet = new Set<string>(
      LIFECYCLE_READINESS_CRITICALITY_LEVELS,
    );
    const ownershipSet = new Set<string>(
      LIFECYCLE_READINESS_OWNERSHIP_CLASSIFICATIONS,
    );
    const policySet = new Set<string>(LIFECYCLE_READINESS_EVIDENCE_POLICIES);
    const gateSet = new Set<string>(LIFECYCLE_READINESS_GATES);
    const externalSystemSet = new Set<string>(
      LIFECYCLE_READINESS_EXTERNAL_REFERENCE_SYSTEMS,
    );
    const cadenceSet = new Set<string>(LIFECYCLE_READINESS_RECURRENCE_CADENCES);
    const evidenceStateSet = new Set<string>(PROJECT_READINESS_EVIDENCE_STATES);

    for (const item of SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS) {
      const id = item.templateItemId;
      expect(familySet.has(item.family), `${id} family`).toBe(true);
      expect(phaseSet.has(item.lifecyclePhase), `${id} lifecyclePhase`).toBe(
        true,
      );
      expect(domainSet.has(item.readinessDomain), `${id} readinessDomain`).toBe(
        true,
      );
      expect(itemTypeSet.has(item.itemType), `${id} itemType`).toBe(true);
      expect(criticalitySet.has(item.criticality), `${id} criticality`).toBe(
        true,
      );
      expect(
        ownershipSet.has(item.ownershipClassification),
        `${id} ownershipClassification`,
      ).toBe(true);
      expect(policySet.has(item.evidencePolicy), `${id} evidencePolicy`).toBe(
        true,
      );
      for (const gate of item.defaultGateImpact) {
        expect(gateSet.has(gate), `${id} defaultGateImpact ${gate}`).toBe(true);
      }
      for (const ref of item.externalReferences) {
        expect(
          externalSystemSet.has(ref.system),
          `${id} externalReference ${ref.system}`,
        ).toBe(true);
      }
      expect(
        PERSONA_SET.has(item.defaultOwnerPersona),
        `${id} defaultOwnerPersona`,
      ).toBe(true);
      if (item.defaultReviewerPersona) {
        expect(
          PERSONA_SET.has(item.defaultReviewerPersona),
          `${id} defaultReviewerPersona`,
        ).toBe(true);
      }
      if (item.recurrence) {
        expect(
          cadenceSet.has(item.recurrence.cadence),
          `${id} recurrence.cadence`,
        ).toBe(true);
      }
      if (item.evidenceLink) {
        expect(
          policySet.has(item.evidenceLink.policy),
          `${id} evidenceLink.policy`,
        ).toBe(true);
        expect(
          evidenceStateSet.has(item.evidenceLink.evidenceState),
          `${id} evidenceLink.evidenceState`,
        ).toBe(true);
      }
    }
  });

  it('preserves source traceability and exact item text distinct from normalized title', () => {
    for (const item of SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS) {
      const id = item.templateItemId;
      expect(item.sourceTrace.family, `${id} sourceTrace.family`).toBe(
        item.family,
      );
      expect(
        item.sourceTrace.exactItemText.length,
        `${id} exactItemText non-empty`,
      ).toBeGreaterThan(0);
      expect(
        item.normalizedTitle === item.sourceTrace.exactItemText,
        `${id} normalizedTitle should differ from exactItemText`,
      ).toBe(false);
      expect(
        item.sourceTrace.sourceTraceabilityRequirement.includes(
          item.sourceTrace.section,
        ),
        `${id} traceability includes section`,
      ).toBe(true);
      expect(
        item.sourceTrace.sourceTraceabilityRequirement.includes(
          item.sourceTrace.sourceFile,
        ),
        `${id} traceability includes sourceFile`,
      ).toBe(true);
      expect(
        item.sourceLineage.sourceModuleId,
        `${id} sourceLineage.sourceModuleId`,
      ).toBe('project-lifecycle-readiness');
    }
  });

  it('safety templates exercise recurring posture and closeout templates surface future closeout exposure', () => {
    const safetyTemplates =
      SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS.filter(
        (t) => t.family === 'safety',
      );
    expect(safetyTemplates.length).toBeGreaterThanOrEqual(2);
    const safetyHasRecurrence = safetyTemplates.some(
      (t) => t.recurrence !== undefined,
    );
    expect(safetyHasRecurrence).toBe(true);
    const closeoutHasFutureExposure =
      SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS.some(
        (t) =>
          t.family === 'closeout' && t.itemType === 'future-closeout-exposure',
      );
    expect(closeoutHasFutureExposure).toBe(true);
  });
});

describe('SAMPLE_LIFECYCLE_READINESS_PROJECT_ITEMS', () => {
  it('has ten unique instances each pointing at an existing template', () => {
    expect(SAMPLE_LIFECYCLE_READINESS_PROJECT_ITEMS.length).toBe(10);
    const ids = SAMPLE_LIFECYCLE_READINESS_PROJECT_ITEMS.map(
      (i) => i.projectItemId,
    );
    expect(new Set(ids).size).toBe(ids.length);
    const templateIds = new Set(
      SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS.map((t) => t.templateItemId),
    );
    for (const inst of SAMPLE_LIFECYCLE_READINESS_PROJECT_ITEMS) {
      expect(
        templateIds.has(inst.templateItemId),
        `${inst.projectItemId} templateItemId resolves`,
      ).toBe(true);
    }
  });

  it('every status is in the Wave 9 status tuple and posture/severity/blocker/confidence reuse Wave 8 vocabularies', () => {
    const statusSet = new Set<string>(LIFECYCLE_READINESS_STATUSES);
    const exceptionSet = new Set<string>(LIFECYCLE_READINESS_EXCEPTION_CODES);
    const postureSet = new Set<string>(PROJECT_READINESS_POSTURES);
    const severitySet = new Set<string>(PROJECT_READINESS_SEVERITIES);
    const blockerSet = new Set<string>(PROJECT_READINESS_BLOCKER_STATES);
    const confidenceSet = new Set<string>(PROJECT_READINESS_CONFIDENCE_STATES);
    const evidenceStateSet = new Set<string>(PROJECT_READINESS_EVIDENCE_STATES);

    let exceptionCount = 0;
    for (const inst of SAMPLE_LIFECYCLE_READINESS_PROJECT_ITEMS) {
      const id = inst.projectItemId;
      expect(statusSet.has(inst.status), `${id} status`).toBe(true);
      expect(postureSet.has(inst.posture), `${id} posture`).toBe(true);
      expect(severitySet.has(inst.severity), `${id} severity`).toBe(true);
      expect(blockerSet.has(inst.blockerState), `${id} blockerState`).toBe(
        true,
      );
      expect(confidenceSet.has(inst.confidence), `${id} confidence`).toBe(true);
      expect(PERSONA_SET.has(inst.ownerPersona), `${id} ownerPersona`).toBe(
        true,
      );
      if (inst.reviewerPersona) {
        expect(
          PERSONA_SET.has(inst.reviewerPersona),
          `${id} reviewerPersona`,
        ).toBe(true);
      }
      if (inst.lastActorPersona) {
        expect(
          PERSONA_SET.has(inst.lastActorPersona),
          `${id} lastActorPersona`,
        ).toBe(true);
      }
      if (inst.completedByPersona) {
        expect(
          PERSONA_SET.has(inst.completedByPersona),
          `${id} completedByPersona`,
        ).toBe(true);
      }
      if (inst.exceptionCode) {
        expect(
          exceptionSet.has(inst.exceptionCode),
          `${id} exceptionCode`,
        ).toBe(true);
        exceptionCount += 1;
      }
      if (inst.evidenceLink) {
        expect(
          evidenceStateSet.has(inst.evidenceLink.evidenceState),
          `${id} evidenceLink.evidenceState`,
        ).toBe(true);
      }
    }
    expect(exceptionCount).toBeGreaterThanOrEqual(2);
  });

  it('safety instance backed by recurring template; closeout instance backed by future-closeout-exposure template', () => {
    const templatesById = new Map(
      SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS.map((t) => [
        t.templateItemId,
        t,
      ]),
    );
    const safetyInstances = SAMPLE_LIFECYCLE_READINESS_PROJECT_ITEMS.filter(
      (i) => i.family === 'safety',
    );
    const safetyHasRecurringBacking = safetyInstances.some((i) => {
      const tpl = templatesById.get(i.templateItemId);
      return tpl?.recurrence !== undefined;
    });
    expect(safetyHasRecurringBacking).toBe(true);

    const closeoutInstances = SAMPLE_LIFECYCLE_READINESS_PROJECT_ITEMS.filter(
      (i) => i.family === 'closeout',
    );
    const closeoutHasFutureExposureBacking = closeoutInstances.some((i) => {
      const tpl = templatesById.get(i.templateItemId);
      return tpl?.itemType === 'future-closeout-exposure';
    });
    expect(closeoutHasFutureExposureBacking).toBe(true);
  });
});

describe('Lifecycle readiness summaries and read-model', () => {
  const PROJECT_ITEM_IDS = new Set(
    SAMPLE_LIFECYCLE_READINESS_PROJECT_ITEMS.map((i) => i.projectItemId),
  );
  const GATE_SET = new Set<string>(LIFECYCLE_READINESS_GATES);
  const DOMAIN_SET = new Set<string>(LIFECYCLE_READINESS_DOMAINS);
  const PHASE_SET = new Set<string>(LIFECYCLE_READINESS_PHASES);
  const EVIDENCE_STATE_SET = new Set<string>(PROJECT_READINESS_EVIDENCE_STATES);
  const BLOCKER_SET = new Set<string>(PROJECT_READINESS_BLOCKER_STATES);

  it('summary keys belong to their Wave 9 tuples', () => {
    expect(SAMPLE_LIFECYCLE_READINESS_GATE_SUMMARIES.length).toBeGreaterThanOrEqual(
      3,
    );
    expect(
      SAMPLE_LIFECYCLE_READINESS_DOMAIN_SUMMARIES.length,
    ).toBeGreaterThanOrEqual(3);
    expect(
      SAMPLE_LIFECYCLE_READINESS_PHASE_SUMMARIES.length,
    ).toBeGreaterThanOrEqual(3);
    for (const s of SAMPLE_LIFECYCLE_READINESS_GATE_SUMMARIES) {
      expect(GATE_SET.has(s.gateId)).toBe(true);
    }
    for (const s of SAMPLE_LIFECYCLE_READINESS_DOMAIN_SUMMARIES) {
      expect(DOMAIN_SET.has(s.domain)).toBe(true);
    }
    for (const s of SAMPLE_LIFECYCLE_READINESS_PHASE_SUMMARIES) {
      expect(PHASE_SET.has(s.phase)).toBe(true);
    }
  });

  it('every summary projectItemId / itemId references a fixture project item', () => {
    const groups: ReadonlyArray<readonly [string, readonly string[]]> = [
      ...SAMPLE_LIFECYCLE_READINESS_GATE_SUMMARIES.map(
        (s) => [`gate ${s.gateId}`, s.projectItemIds] as const,
      ),
      ...SAMPLE_LIFECYCLE_READINESS_DOMAIN_SUMMARIES.map(
        (s) => [`domain ${s.domain}`, s.projectItemIds] as const,
      ),
      ...SAMPLE_LIFECYCLE_READINESS_PHASE_SUMMARIES.map(
        (s) => [`phase ${s.phase}`, s.projectItemIds] as const,
      ),
      ...SAMPLE_LIFECYCLE_READINESS_EVIDENCE_SUMMARY.map(
        (s) => [`evidence ${s.evidenceState}`, s.itemIds] as const,
      ),
      ...SAMPLE_LIFECYCLE_READINESS_BLOCKER_SUMMARY.map(
        (s) => [`blocker ${s.blockerState}`, s.itemIds] as const,
      ),
    ];
    for (const [label, ids] of groups) {
      for (const id of ids) {
        expect(PROJECT_ITEM_IDS.has(id), `${label}: ${id}`).toBe(true);
      }
    }
  });

  it('evidence and blocker summaries reuse Wave 8 vocabularies', () => {
    for (const s of SAMPLE_LIFECYCLE_READINESS_EVIDENCE_SUMMARY) {
      expect(EVIDENCE_STATE_SET.has(s.evidenceState)).toBe(true);
    }
    for (const s of SAMPLE_LIFECYCLE_READINESS_BLOCKER_SUMMARY) {
      expect(BLOCKER_SET.has(s.blockerState)).toBe(true);
    }
  });

  it('read-model wraps the fixture arrays and library metadata', () => {
    expect(SAMPLE_LIFECYCLE_READINESS_READ_MODEL.sampleTemplateItems).toBe(
      SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS,
    );
    expect(SAMPLE_LIFECYCLE_READINESS_READ_MODEL.sampleProjectItems).toBe(
      SAMPLE_LIFECYCLE_READINESS_PROJECT_ITEMS,
    );
    expect(SAMPLE_LIFECYCLE_READINESS_READ_MODEL.templateLibraryMetadata).toBe(
      LIFECYCLE_READINESS_LIBRARY_METADATA,
    );
    expect(SAMPLE_LIFECYCLE_READINESS_READ_MODEL.summary).toBe(
      SAMPLE_LIFECYCLE_READINESS_SUMMARY,
    );
    expect(SAMPLE_LIFECYCLE_READINESS_READ_MODEL_ALIAS).toBe(
      SAMPLE_LIFECYCLE_READINESS_READ_MODEL,
    );
  });

  it('summary totals match the project-item fixture length', () => {
    expect(SAMPLE_LIFECYCLE_READINESS_SUMMARY.totalProjectItems).toBe(
      SAMPLE_LIFECYCLE_READINESS_PROJECT_ITEMS.length,
    );
    const sum = LIFECYCLE_READINESS_STATUSES.reduce(
      (acc, status) =>
        acc + SAMPLE_LIFECYCLE_READINESS_SUMMARY.statusCounts[status],
      0,
    );
    expect(sum).toBe(SAMPLE_LIFECYCLE_READINESS_PROJECT_ITEMS.length);
  });
});

describe('Lifecycle readiness source-scan guards', () => {
  it('framework module imports no SPFx, PnP, Azure, HTTP, Procore, backend, or sibling boundary packages', () => {
    const stripped = strip(readFileSync(FRAMEWORK_FILE, 'utf8'));
    const importLines = stripped
      .split('\n')
      .filter((line) => /\bimport\b/.test(line) || /\bfrom\b/.test(line));
    for (const line of importLines) {
      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        expect(pattern.test(line), `forbidden import: ${line.trim()}`).toBe(
          false,
        );
      }
    }
  });

  it('framework module does not redefine Wave 8 PROJECT_READINESS_ vocabularies', () => {
    const stripped = strip(readFileSync(FRAMEWORK_FILE, 'utf8'));
    expect(stripped).not.toMatch(/\bexport\s+const\s+PROJECT_READINESS_/);
    expect(stripped).not.toMatch(/\bexport\s+interface\s+IProjectReadiness/);
  });

  it('fixture module is deterministic and uses only example.invalid URLs and example.com UPNs', () => {
    const raw = readFileSync(FIXTURE_FILE, 'utf8');
    const stripped = strip(raw);
    const NON_DETERMINISTIC = [
      /\bMath\.random\s*\(/,
      /\bDate\.now\s*\(/,
      /\bcrypto\.randomUUID\s*\(/,
      /\bperformance\.now\s*\(/,
    ];
    for (const pattern of NON_DETERMINISTIC) {
      expect(stripped, `fixture matched ${pattern}`).not.toMatch(pattern);
    }
    const liveUrls =
      raw.match(/https?:\/\/(?!example\.invalid)[^\s'"`]+/g) ?? [];
    expect(liveUrls).toEqual([]);
    const liveUpns =
      raw.match(/[A-Za-z0-9._-]+@(?!example\.com\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [];
    expect(liveUpns).toEqual([]);
  });
});
