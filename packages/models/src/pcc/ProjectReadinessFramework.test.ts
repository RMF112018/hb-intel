import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  PCC_PERSONAS,
  PCC_READ_MODEL_SOURCE_STATUSES,
  PROJECT_READINESS_BLOCKER_STATES,
  PROJECT_READINESS_CONFIDENCE_STATES,
  PROJECT_READINESS_DOMAINS,
  PROJECT_READINESS_EVIDENCE_STATES,
  PROJECT_READINESS_LIFECYCLE_GATES,
  PROJECT_READINESS_POSTURES,
  PROJECT_READINESS_SEVERITIES,
  PROJECT_READINESS_SOURCE_MODULES,
  PROJECT_READINESS_STATUSES,
  type PccPersona,
  type PccReadModelEnvelope,
  type PccReadModelResponseMap,
  type PccProjectReadinessFrameworkReadModel,
} from './index.js';
import {
  SAMPLE_PROJECT_READINESS_ITEMS,
  SAMPLE_PROJECT_READINESS_DOMAIN_SUMMARIES,
  SAMPLE_PROJECT_READINESS_GATE_SUMMARIES,
  SAMPLE_PROJECT_READINESS_OWNERSHIP_SUMMARIES,
  SAMPLE_PROJECT_READINESS_EVIDENCE_SUMMARY,
  SAMPLE_PROJECT_READINESS_BLOCKER_SUMMARY,
  SAMPLE_PROJECT_READINESS_SOURCE_HEALTH_SUMMARY,
  SAMPLE_PROJECT_READINESS_FRAMEWORK_SNAPSHOT,
  SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL,
} from './fixtures/projectReadiness.js';

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
  /procore/i,
  /\.\.\/\.\.\/\.\.\/backend\//,
  /\b@hbc\/project-site-provisioning\b/,
  /\b@hbc\/project-site-template\b/,
];

const FRAMEWORK_FILE = fileURLToPath(new URL('./ProjectReadinessFramework.ts', import.meta.url));
const FIXTURE_FILE = fileURLToPath(
  new URL('./fixtures/projectReadiness.ts', import.meta.url),
);

describe('Project Readiness Framework constants', () => {
  it('every constant tuple is non-empty and unique', () => {
    const tuples: ReadonlyArray<readonly [string, readonly string[]]> = [
      ['PROJECT_READINESS_DOMAINS', PROJECT_READINESS_DOMAINS],
      ['PROJECT_READINESS_LIFECYCLE_GATES', PROJECT_READINESS_LIFECYCLE_GATES],
      ['PROJECT_READINESS_SOURCE_MODULES', PROJECT_READINESS_SOURCE_MODULES],
      ['PROJECT_READINESS_STATUSES', PROJECT_READINESS_STATUSES],
      ['PROJECT_READINESS_POSTURES', PROJECT_READINESS_POSTURES],
      ['PROJECT_READINESS_BLOCKER_STATES', PROJECT_READINESS_BLOCKER_STATES],
      ['PROJECT_READINESS_SEVERITIES', PROJECT_READINESS_SEVERITIES],
      ['PROJECT_READINESS_CONFIDENCE_STATES', PROJECT_READINESS_CONFIDENCE_STATES],
      ['PROJECT_READINESS_EVIDENCE_STATES', PROJECT_READINESS_EVIDENCE_STATES],
    ];
    for (const [name, tuple] of tuples) {
      expect(tuple.length, `${name} should be non-empty`).toBeGreaterThan(0);
      const unique = new Set(tuple);
      expect(unique.size, `${name} should have unique values`).toBe(tuple.length);
    }
  });
});

describe('SAMPLE_PROJECT_READINESS_ITEMS', () => {
  it('has at least seven items, five domains, and four lifecycle gates', () => {
    expect(SAMPLE_PROJECT_READINESS_ITEMS.length).toBeGreaterThanOrEqual(7);
    const domains = new Set(SAMPLE_PROJECT_READINESS_ITEMS.map((it) => it.domain));
    const gates = new Set(SAMPLE_PROJECT_READINESS_ITEMS.map((it) => it.lifecycleGate));
    expect(domains.size).toBeGreaterThanOrEqual(5);
    expect(gates.size).toBeGreaterThanOrEqual(4);
  });

  it('has unique item ids', () => {
    const ids = SAMPLE_PROJECT_READINESS_ITEMS.map((it) => it.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every enum-valued field uses values from the corresponding tuple', () => {
    const domainSet = new Set<string>(PROJECT_READINESS_DOMAINS);
    const gateSet = new Set<string>(PROJECT_READINESS_LIFECYCLE_GATES);
    const sourceModuleSet = new Set<string>(PROJECT_READINESS_SOURCE_MODULES);
    const statusSet = new Set<string>(PROJECT_READINESS_STATUSES);
    const severitySet = new Set<string>(PROJECT_READINESS_SEVERITIES);
    const blockerSet = new Set<string>(PROJECT_READINESS_BLOCKER_STATES);
    const evidenceSet = new Set<string>(PROJECT_READINESS_EVIDENCE_STATES);
    const postureSet = new Set<string>(PROJECT_READINESS_POSTURES);
    const confidenceSet = new Set<string>(PROJECT_READINESS_CONFIDENCE_STATES);
    const sourceHealthSet = new Set<string>(PCC_READ_MODEL_SOURCE_STATUSES);

    for (const item of SAMPLE_PROJECT_READINESS_ITEMS) {
      expect(domainSet.has(item.domain), `${item.id} domain`).toBe(true);
      expect(gateSet.has(item.lifecycleGate), `${item.id} lifecycleGate`).toBe(true);
      expect(sourceModuleSet.has(item.sourceModuleId), `${item.id} sourceModuleId`).toBe(true);
      expect(statusSet.has(item.status), `${item.id} status`).toBe(true);
      expect(severitySet.has(item.severity), `${item.id} severity`).toBe(true);
      expect(blockerSet.has(item.blockerState), `${item.id} blockerState`).toBe(true);
      expect(postureSet.has(item.posture), `${item.id} posture`).toBe(true);
      expect(confidenceSet.has(item.confidence), `${item.id} confidence`).toBe(true);
      expect(
        sourceHealthSet.has(item.sourceHealthStatus),
        `${item.id} sourceHealthStatus`,
      ).toBe(true);
      if (item.evidenceRequirement) {
        expect(
          evidenceSet.has(item.evidenceRequirement.evidenceState),
          `${item.id} evidenceState`,
        ).toBe(true);
      }
    }
  });

  it('every ownerPersona, reviewerPersona, lastActorPersona, and escalationPath value is a known PccPersona', () => {
    for (const item of SAMPLE_PROJECT_READINESS_ITEMS) {
      expect(PERSONA_SET.has(item.ownerPersona), `${item.id} ownerPersona`).toBe(true);
      if (item.reviewerPersona) {
        expect(PERSONA_SET.has(item.reviewerPersona), `${item.id} reviewerPersona`).toBe(true);
      }
      if (item.lastActorPersona) {
        expect(PERSONA_SET.has(item.lastActorPersona), `${item.id} lastActorPersona`).toBe(
          true,
        );
      }
      for (const persona of item.escalationPath ?? []) {
        expect(PERSONA_SET.has(persona), `${item.id} escalationPath`).toBe(true);
      }
    }
  });

  it('every dependencyItemIds value resolves to an existing item id', () => {
    const ids = new Set(SAMPLE_PROJECT_READINESS_ITEMS.map((it) => it.id));
    for (const item of SAMPLE_PROJECT_READINESS_ITEMS) {
      for (const dep of item.dependencyItemIds) {
        expect(ids.has(dep), `${item.id} dependency ${dep}`).toBe(true);
      }
    }
  });
});

describe('Project Readiness summaries', () => {
  const ITEM_IDS = new Set(SAMPLE_PROJECT_READINESS_ITEMS.map((it) => it.id));
  const DOMAIN_SET = new Set<string>(PROJECT_READINESS_DOMAINS);
  const GATE_SET = new Set<string>(PROJECT_READINESS_LIFECYCLE_GATES);
  const SOURCE_MODULE_SET = new Set<string>(PROJECT_READINESS_SOURCE_MODULES);
  const SOURCE_HEALTH_SET = new Set<string>(PCC_READ_MODEL_SOURCE_STATUSES);

  it('every summary itemId references an existing fixture item', () => {
    const summaryItemIdGroups: ReadonlyArray<readonly [string, readonly string[]]> = [
      ...SAMPLE_PROJECT_READINESS_DOMAIN_SUMMARIES.map(
        (s) => [`domain ${s.domain}`, s.itemIds] as const,
      ),
      ...SAMPLE_PROJECT_READINESS_GATE_SUMMARIES.map(
        (s) => [`gate ${s.lifecycleGate}`, s.itemIds] as const,
      ),
      ...SAMPLE_PROJECT_READINESS_OWNERSHIP_SUMMARIES.map(
        (s) => [`ownership ${s.ownerPersona}`, s.assignedItemIds] as const,
      ),
      ...SAMPLE_PROJECT_READINESS_EVIDENCE_SUMMARY.map(
        (s) => [`evidence ${s.evidenceState}`, s.itemIds] as const,
      ),
      ...SAMPLE_PROJECT_READINESS_BLOCKER_SUMMARY.map(
        (s) => [`blocker ${s.blockerState}`, s.itemIds] as const,
      ),
      ...SAMPLE_PROJECT_READINESS_SOURCE_HEALTH_SUMMARY.map(
        (s) => [`source-health ${s.sourceModuleId}`, s.itemIds] as const,
      ),
    ];
    for (const [label, ids] of summaryItemIdGroups) {
      for (const id of ids) {
        expect(ITEM_IDS.has(id), `${label}: ${id}`).toBe(true);
      }
    }
  });

  it('every summary key value is in its registry tuple', () => {
    for (const s of SAMPLE_PROJECT_READINESS_DOMAIN_SUMMARIES) {
      expect(DOMAIN_SET.has(s.domain)).toBe(true);
    }
    for (const s of SAMPLE_PROJECT_READINESS_GATE_SUMMARIES) {
      expect(GATE_SET.has(s.lifecycleGate)).toBe(true);
    }
    for (const s of SAMPLE_PROJECT_READINESS_OWNERSHIP_SUMMARIES) {
      expect(PERSONA_SET.has(s.ownerPersona)).toBe(true);
    }
    for (const s of SAMPLE_PROJECT_READINESS_SOURCE_HEALTH_SUMMARY) {
      expect(SOURCE_MODULE_SET.has(s.sourceModuleId)).toBe(true);
      expect(SOURCE_HEALTH_SET.has(s.sourceHealthStatus)).toBe(true);
    }
  });

  it('snapshot aggregates all summary slots and exposes a read-model alias', () => {
    expect(SAMPLE_PROJECT_READINESS_FRAMEWORK_SNAPSHOT.items).toEqual(
      SAMPLE_PROJECT_READINESS_ITEMS,
    );
    expect(SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL).toBe(
      SAMPLE_PROJECT_READINESS_FRAMEWORK_SNAPSHOT,
    );
  });
});

describe('PccReadModelResponseMap registration', () => {
  it("contains a 'project-readiness' envelope wrapping the framework read-model", () => {
    const envelope: PccReadModelEnvelope<PccProjectReadinessFrameworkReadModel> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL,
    };
    const slot: PccReadModelResponseMap['project-readiness'] = envelope;
    expect(slot.readOnly).toBe(true);
    expect(slot.data.items.length).toBe(SAMPLE_PROJECT_READINESS_ITEMS.length);
  });
});

describe('Project Readiness source-scan guards', () => {
  it('framework module imports no SPFx, PnP, Azure, HTTP, Procore, backend, or sibling boundary packages', () => {
    const stripped = strip(readFileSync(FRAMEWORK_FILE, 'utf8'));
    const importLines = stripped
      .split('\n')
      .filter((line) => /\bimport\b/.test(line) || /\bfrom\b/.test(line));
    for (const line of importLines) {
      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        expect(pattern.test(line), `forbidden import: ${line.trim()}`).toBe(false);
      }
    }
  });

  it('fixture module is deterministic and uses only example.invalid URLs and example.com UPNs', () => {
    const stripped = strip(readFileSync(FIXTURE_FILE, 'utf8'));
    const NON_DETERMINISTIC = [
      /\bMath\.random\s*\(/,
      /\bDate\.now\s*\(/,
      /\bcrypto\.randomUUID\s*\(/,
      /\bperformance\.now\s*\(/,
    ];
    for (const pattern of NON_DETERMINISTIC) {
      expect(stripped, `fixture matched ${pattern}`).not.toMatch(pattern);
    }
    const raw = readFileSync(FIXTURE_FILE, 'utf8');
    const liveUrls = raw.match(/https?:\/\/(?!example\.invalid)[^\s'"`]+/g) ?? [];
    expect(liveUrls).toEqual([]);
    const liveUpns =
      raw.match(/[A-Za-z0-9._-]+@(?!example\.com\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [];
    expect(liveUpns).toEqual([]);
  });
});
