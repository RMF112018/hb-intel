import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  PROJECT_READINESS_CONFIDENCE_STATES,
  PCC_READ_MODEL_SOURCE_STATUSES,
  RESPONSIBILITY_ASSIGNMENT_LIFECYCLE_STATES,
  RESPONSIBILITY_AUDIT_EVENT_TYPES,
  RESPONSIBILITY_CONTRACT_PARTIES,
  RESPONSIBILITY_CRITICALITIES,
  RESPONSIBILITY_DOMAINS,
  RESPONSIBILITY_EVIDENCE_LINK_STATES,
  RESPONSIBILITY_EXCEPTION_CODES,
  RESPONSIBILITY_HEALTH_BANDS,
  RESPONSIBILITY_ITEM_CLASSIFICATIONS,
  RESPONSIBILITY_MATRIX_LANES,
  RESPONSIBILITY_RACI_VALUES,
  RESPONSIBILITY_SOURCE_MARKS,
  RESPONSIBILITY_SOURCE_SHEETS,
  RESPONSIBILITY_TEMPLATE_STATUSES,
  RESPONSIBILITY_WORKBOOK_TYPES,
  RESPONSIBILITY_WORKFLOW_STEP_STATES,
  RESPONSIBILITY_WORKFLOW_STEP_TYPES,
  type IResponsibilityAssignment,
  type IResponsibilityEvidenceLinkRef,
  type IResponsibilityNormalizedAssignment,
  type ResponsibilityMatrixHealthScore,
} from './index.js';
import {
  SAMPLE_RESPONSIBILITY_MATRIX_AUDIT_EVENTS,
  SAMPLE_RESPONSIBILITY_MATRIX_HEALTH_SCORE,
  SAMPLE_RESPONSIBILITY_MATRIX_INSUFFICIENT_DATA_HEALTH_SCORE,
  SAMPLE_RESPONSIBILITY_MATRIX_PROJECT_INSTANCES,
  SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL,
  SAMPLE_RESPONSIBILITY_MATRIX_SNAPSHOT_HISTORY,
  SAMPLE_RESPONSIBILITY_MATRIX_SOURCE_POSTURE,
  SAMPLE_RESPONSIBILITY_MATRIX_TEMPLATES,
  SAMPLE_RESPONSIBILITY_MATRIX_WORKBOOK_SOURCE_SUMMARY,
} from './fixtures/responsibilityMatrix.js';

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
  /\b@hbc\/auth\b/,
  /\b@hbc\/spfx-/,
  /\b@hbc\/sharepoint-/,
  /\b@hbc\/functions\b/,
  /\b@hbc\/project-site-provisioning\b/,
  /\b@hbc\/project-site-template\b/,
  /\bnode:fs\b/,
  /\bnode:net\b/,
  /\bnode:http\b/,
];

const CONTRACT_FILE = fileURLToPath(new URL('./ResponsibilityMatrix.ts', import.meta.url));
const FIXTURE_FILE = fileURLToPath(new URL('./fixtures/responsibilityMatrix.ts', import.meta.url));

describe('Responsibility Matrix vocabularies', () => {
  it('every constant tuple is non-empty and unique', () => {
    const tuples: ReadonlyArray<readonly [string, readonly string[]]> = [
      ['RESPONSIBILITY_RACI_VALUES', RESPONSIBILITY_RACI_VALUES],
      ['RESPONSIBILITY_CONTRACT_PARTIES', RESPONSIBILITY_CONTRACT_PARTIES],
      ['RESPONSIBILITY_SOURCE_MARKS', RESPONSIBILITY_SOURCE_MARKS],
      ['RESPONSIBILITY_WORKBOOK_TYPES', RESPONSIBILITY_WORKBOOK_TYPES],
      ['RESPONSIBILITY_SOURCE_SHEETS', RESPONSIBILITY_SOURCE_SHEETS],
      ['RESPONSIBILITY_TEMPLATE_STATUSES', RESPONSIBILITY_TEMPLATE_STATUSES],
      ['RESPONSIBILITY_ITEM_CLASSIFICATIONS', RESPONSIBILITY_ITEM_CLASSIFICATIONS],
      ['RESPONSIBILITY_CRITICALITIES', RESPONSIBILITY_CRITICALITIES],
      ['RESPONSIBILITY_DOMAINS', RESPONSIBILITY_DOMAINS],
      ['RESPONSIBILITY_ASSIGNMENT_LIFECYCLE_STATES', RESPONSIBILITY_ASSIGNMENT_LIFECYCLE_STATES],
      ['RESPONSIBILITY_WORKFLOW_STEP_TYPES', RESPONSIBILITY_WORKFLOW_STEP_TYPES],
      ['RESPONSIBILITY_WORKFLOW_STEP_STATES', RESPONSIBILITY_WORKFLOW_STEP_STATES],
      ['RESPONSIBILITY_EXCEPTION_CODES', RESPONSIBILITY_EXCEPTION_CODES],
      ['RESPONSIBILITY_HEALTH_BANDS', RESPONSIBILITY_HEALTH_BANDS],
      ['RESPONSIBILITY_AUDIT_EVENT_TYPES', RESPONSIBILITY_AUDIT_EVENT_TYPES],
      ['RESPONSIBILITY_EVIDENCE_LINK_STATES', RESPONSIBILITY_EVIDENCE_LINK_STATES],
      ['RESPONSIBILITY_MATRIX_LANES', RESPONSIBILITY_MATRIX_LANES],
    ];
    for (const [name, tuple] of tuples) {
      expect(tuple.length, `${name} should be non-empty`).toBeGreaterThan(0);
      expect(new Set(tuple).size, `${name} should be unique`).toBe(tuple.length);
    }
  });

  it('RACI internal axis and contract-party axis share no overlapping literals', () => {
    const raciSet = new Set<string>(RESPONSIBILITY_RACI_VALUES);
    const partySet = new Set<string>(RESPONSIBILITY_CONTRACT_PARTIES);
    const overlap = [...raciSet].filter((value) => partySet.has(value));
    expect(overlap, "'Consulted' RACI must never collide with 'Contractor' party").toEqual([]);
    expect(raciSet.has('Consulted')).toBe(true);
    expect(partySet.has('Contractor')).toBe(true);
    expect(raciSet.has('Contractor')).toBe(false);
    expect(partySet.has('Consulted')).toBe(false);
  });

  it('only explicit source marks (R/A/C/I) map directly to RACI; others remain Unknown', () => {
    const explicit = new Set(['R', 'A', 'C', 'I']);
    for (const sample of SAMPLE_RESPONSIBILITY_MATRIX_TEMPLATES.flatMap((t) => t.baselineRaci)) {
      const isExplicit = explicit.has(sample.sourceMark);
      if (!isExplicit) {
        expect(sample.raciValue).toBe('Unknown');
        expect(sample.requiresUserReview).toBe(true);
      }
    }
    const ambiguous: IResponsibilityNormalizedAssignment = {
      roleRef: { roleCode: 'PM', label: 'PM', required: true },
      raciValue: 'Unknown',
      sourceMark: 'Support',
      requiresUserReview: true,
    };
    expect(ambiguous.requiresUserReview).toBe(true);
  });

  it('eight-lane vocabulary contains canonical lane identifiers', () => {
    expect(RESPONSIBILITY_MATRIX_LANES).toHaveLength(8);
    expect(RESPONSIBILITY_MATRIX_LANES).toContain('matrix');
    expect(RESPONSIBILITY_MATRIX_LANES).toContain('owner-contract-mapping');
    expect(RESPONSIBILITY_MATRIX_LANES).toContain('handoffs');
    expect(RESPONSIBILITY_MATRIX_LANES).toContain('template-and-admin');
  });
});

describe('Responsibility Matrix workbook source posture', () => {
  it('fixture summary mirrors canonical 109 / 82 / 27 / 98 / 47 / 0 posture', () => {
    expect(SAMPLE_RESPONSIBILITY_MATRIX_WORKBOOK_SOURCE_SUMMARY.defaultItemsTotal).toBe(109);
    expect(SAMPLE_RESPONSIBILITY_MATRIX_WORKBOOK_SOURCE_SUMMARY.pmItems).toBe(82);
    expect(SAMPLE_RESPONSIBILITY_MATRIX_WORKBOOK_SOURCE_SUMMARY.fieldItems).toBe(27);
    expect(SAMPLE_RESPONSIBILITY_MATRIX_WORKBOOK_SOURCE_SUMMARY.strictMarkedRows).toBe(98);
    expect(SAMPLE_RESPONSIBILITY_MATRIX_WORKBOOK_SOURCE_SUMMARY.ambiguousItemsTotal).toBe(47);
    expect(
      SAMPLE_RESPONSIBILITY_MATRIX_WORKBOOK_SOURCE_SUMMARY.ownerContractActiveDefaultObligations,
    ).toBe(0);
    expect(SAMPLE_RESPONSIBILITY_MATRIX_WORKBOOK_SOURCE_SUMMARY.sourceFiles.length).toBe(2);
  });

  it('owner-contract templates are placeholder/schema-only with zero active obligations', () => {
    const ownerContractActiveCount = SAMPLE_RESPONSIBILITY_MATRIX_TEMPLATES.filter(
      (t) =>
        t.sourceSnapshot.workbookType === 'owner-contract-responsibility-matrix' &&
        t.classification === 'active-default-obligation',
    ).length;
    expect(ownerContractActiveCount).toBe(0);
    const ownerContractTemplates = SAMPLE_RESPONSIBILITY_MATRIX_TEMPLATES.filter(
      (t) => t.sourceSnapshot.workbookType === 'owner-contract-responsibility-matrix',
    );
    for (const template of ownerContractTemplates) {
      expect(template.classification).toBe('placeholder-schema-only');
      expect(template.baselineRaci).toEqual([]);
    }
  });
});

describe('Responsibility Matrix accountability invariant', () => {
  it('healthy assignment has exactly one accountable owner and no shared exception', () => {
    const healthy: IResponsibilityAssignment = {
      ownerRole: { roleCode: 'PM', label: 'PM', required: true },
      supportRoles: [],
      reviewerRoles: [],
      signOffRoles: [],
      accountableOwner: { personId: 'PERSON-RM-01', displayName: 'Sample', isActive: true },
      isOverdue: false,
      lifecycleState: 'created',
    };
    expect(healthy.accountableOwner).toBeDefined();
    expect(healthy.sharedAccountabilityException).toBeUndefined();
  });

  it('shared accountability requires explicit governed exception', () => {
    const shared: IResponsibilityAssignment = {
      ownerRole: { roleCode: 'PM', label: 'PM', required: true },
      supportRoles: [
        { roleCode: 'PM2', label: 'PM2', required: false },
        { roleCode: 'PX', label: 'PX', required: true },
      ],
      reviewerRoles: [],
      signOffRoles: [],
      isOverdue: false,
      lifecycleState: 'created',
      sharedAccountabilityException: {
        reason: 'Governed shared posture for placeholder schema row.',
      },
    };
    expect(shared.sharedAccountabilityException).toBeDefined();
    expect(shared.sharedAccountabilityException?.reason.length).toBeGreaterThan(0);
  });
});

describe('Responsibility Matrix evidence-link reference-only', () => {
  it('evidence link shape exposes only reference fields (no binary/url/blob)', () => {
    const allowedKeys = new Set(['documentControlSourceId', 'itemRef', 'status']);
    const forbiddenKeyPattern = /^(content|binary|fileBytes|data|payload|url|href|blob|base64)$/i;
    const allEvidenceLinks = SAMPLE_RESPONSIBILITY_MATRIX_PROJECT_INSTANCES.flatMap(
      (i) => i.evidenceLinks ?? [],
    );
    expect(allEvidenceLinks.length).toBeGreaterThan(0);
    for (const link of allEvidenceLinks) {
      for (const key of Object.keys(link)) {
        expect(allowedKeys.has(key), `evidence link key ${key} must be reference-only`).toBe(true);
        expect(
          forbiddenKeyPattern.test(key),
          `evidence link key ${key} must not be binary/url`,
        ).toBe(false);
      }
    }
    const sample: IResponsibilityEvidenceLinkRef = {
      documentControlSourceId: 'project-record',
      status: 'present',
    };
    expect(RESPONSIBILITY_EVIDENCE_LINK_STATES).toContain(sample.status);
  });
});

describe('Responsibility Matrix health-score discriminated union', () => {
  it('insufficient-data branch exposes reason but no band', () => {
    const score: ResponsibilityMatrixHealthScore =
      SAMPLE_RESPONSIBILITY_MATRIX_INSUFFICIENT_DATA_HEALTH_SCORE;
    expect(score.state).toBe('insufficient-data');
    if (score.state === 'insufficient-data') {
      expect(typeof score.reason).toBe('string');
      // @ts-expect-error band is not part of the insufficient-data branch
      const band = score.band;
      expect(band).toBeUndefined();
    }
  });

  it('computed branch exposes band and numeric input counts', () => {
    const score: ResponsibilityMatrixHealthScore = SAMPLE_RESPONSIBILITY_MATRIX_HEALTH_SCORE;
    expect(score.state).toBe('computed');
    if (score.state === 'computed') {
      expect(RESPONSIBILITY_HEALTH_BANDS).toContain(score.band);
      expect(typeof score.openCriticalExceptions).toBe('number');
      expect(typeof score.overdueActions).toBe('number');
      expect(typeof score.missingAccountableOwners).toBe('number');
      expect(typeof score.missingCurrentActionOwners).toBe('number');
      expect(typeof score.pendingEvidence).toBe('number');
      expect(typeof score.unresolvedDecisionRightsGaps).toBe('number');
    }
  });
});

describe('Responsibility Matrix read-model coverage', () => {
  it('snapshot history contains at least one record with matching counts', () => {
    expect(SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL.snapshotHistory.length).toBeGreaterThanOrEqual(
      1,
    );
    for (const snapshot of SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL.snapshotHistory) {
      expect(snapshot.readOnly).toBe(true);
      expect(snapshot.counts).toEqual(SAMPLE_RESPONSIBILITY_MATRIX_WORKBOOK_SOURCE_SUMMARY);
    }
    expect(SAMPLE_RESPONSIBILITY_MATRIX_SNAPSHOT_HISTORY.length).toBeGreaterThanOrEqual(1);
  });

  it('audit events cover assignment / current-owner / evidence-ref / snapshot families', () => {
    const types = new Set(SAMPLE_RESPONSIBILITY_MATRIX_AUDIT_EVENTS.map((e) => e.eventType));
    expect(types.has('assignment-changed')).toBe(true);
    expect(types.has('current-owner-changed')).toBe(true);
    expect(types.has('evidence-ref-changed')).toBe(true);
    expect(types.has('snapshot-generated')).toBe(true);
    for (const event of SAMPLE_RESPONSIBILITY_MATRIX_AUDIT_EVENTS) {
      expect(RESPONSIBILITY_AUDIT_EVENT_TYPES).toContain(event.eventType);
    }
  });

  it('source posture reuses PccReadModelSourceStatus and ProjectReadinessConfidenceState', () => {
    expect(PCC_READ_MODEL_SOURCE_STATUSES).toContain(
      SAMPLE_RESPONSIBILITY_MATRIX_SOURCE_POSTURE.sourceStatus,
    );
    if (SAMPLE_RESPONSIBILITY_MATRIX_SOURCE_POSTURE.confidence !== undefined) {
      expect(PROJECT_READINESS_CONFIDENCE_STATES).toContain(
        SAMPLE_RESPONSIBILITY_MATRIX_SOURCE_POSTURE.confidence,
      );
    }
    expect(SAMPLE_RESPONSIBILITY_MATRIX_SOURCE_POSTURE.pendingHumanReviewCount).toBe(
      SAMPLE_RESPONSIBILITY_MATRIX_WORKBOOK_SOURCE_SUMMARY.ambiguousItemsTotal,
    );
  });
});

describe('Responsibility Matrix fixture safety', () => {
  it('no live URLs except example.invalid placeholders', () => {
    const json = JSON.stringify(SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL);
    const urls = json.match(/https?:\/\/[^\s"'<>]+/g) ?? [];
    for (const url of urls) {
      expect(url, `live URL detected: ${url}`).toMatch(/^https?:\/\/[^/]*example\.invalid(?:\/|$)/);
    }
  });

  it('no email/UPN values reference domains other than example.invalid', () => {
    const json = JSON.stringify(SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL);
    const emails = json.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [];
    for (const email of emails) {
      expect(email, `non-example email detected: ${email}`).toMatch(/@example\.invalid$/);
    }
  });

  it('owner-contract copy carries no legal-interpretation phrasing', () => {
    const forbidden = [
      /legal advice/i,
      /binding obligation/i,
      /contract amendment/i,
      /executed contract/i,
    ];
    const ownerTemplates = SAMPLE_RESPONSIBILITY_MATRIX_TEMPLATES.filter(
      (t) => t.sourceSnapshot.workbookType === 'owner-contract-responsibility-matrix',
    );
    for (const template of ownerTemplates) {
      const text = JSON.stringify(template);
      for (const pattern of forbidden) {
        expect(pattern.test(text), `owner-contract template contains ${pattern}`).toBe(false);
      }
    }
    const json = JSON.stringify(SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL);
    for (const pattern of forbidden) {
      expect(pattern.test(json), `read-model contains forbidden phrase ${pattern}`).toBe(false);
    }
  });
});

describe('Responsibility Matrix source-scan guards', () => {
  it('contract module imports no SPFx, PnP, Azure, HTTP, Procore, or backend boundary packages', () => {
    const stripped = strip(readFileSync(CONTRACT_FILE, 'utf8'));
    const importLines = stripped
      .split('\n')
      .filter((line) => /\bimport\b/.test(line) || /\bfrom\b/.test(line));
    for (const line of importLines) {
      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        expect(pattern.test(line), `forbidden import in contract: ${line}`).toBe(false);
      }
    }
  });

  it('fixture module imports no SPFx, PnP, Azure, HTTP, Procore, or backend boundary packages', () => {
    const stripped = strip(readFileSync(FIXTURE_FILE, 'utf8'));
    const importLines = stripped
      .split('\n')
      .filter((line) => /\bimport\b/.test(line) || /\bfrom\b/.test(line));
    for (const line of importLines) {
      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        expect(pattern.test(line), `forbidden import in fixture: ${line}`).toBe(false);
      }
    }
  });

  it('contract module declares no mutation/runtime helper tokens', () => {
    const stripped = strip(readFileSync(CONTRACT_FILE, 'utf8'));
    const forbidden = [
      /\bfunction\s+[a-zA-Z_$][\w$]*\s*\(/,
      /\bclass\s+[A-Z][\w$]*\b/,
      /\bnew\s+XMLHttpRequest\b/,
      /\bfetch\s*\(/,
    ];
    for (const pattern of forbidden) {
      expect(pattern.test(stripped), `forbidden runtime construct in contract: ${pattern}`).toBe(
        false,
      );
    }
  });
});
