import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findForbiddenFixtureKeys } from '../PccFixtureGuards.js';
import {
  PCC_FIXTURES,
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_PROJECT_PROFILE_PRECONSTRUCTION,
  SAMPLE_PROJECT_PROFILES,
  SAMPLE_PRIORITY_ACTIONS,
  SAMPLE_WORKFLOW_ITEMS,
  SAMPLE_WORKFLOW_ITEM_ASSIGNMENTS,
  SAMPLE_WORKFLOW_ITEM_ASSIGNMENT_HISTORY,
  SAMPLE_WORKFLOW_ITEM_TRANSITIONS,
  SAMPLE_APPROVAL_CHECKPOINTS,
  SAMPLE_REVIEWER_ACTIONS,
  SAMPLE_BUSINESS_AUDIT_EVENTS,
  SAMPLE_COMMENTS,
  SAMPLE_COMMENT_HISTORY,
  SAMPLE_EXTERNAL_SYSTEM_LINKS,
  SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
  SAMPLE_LAUNCH_LINKS,
  SAMPLE_DOCUMENT_CONTROL_SOURCE_IDS,
  SAMPLE_TEAM_ACCESS_MEMBERS,
  SAMPLE_TEAM_ACCESS_VIEWER_LANE,
  SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE,
  SAMPLE_TEAM_ACCESS_ACCESS_MANAGER_LANE,
  SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
  SAMPLE_SITE_HEALTH_CHECKS,
  SAMPLE_DRIFT_INDICATORS,
  SAMPLE_SITE_HEALTH_SUMMARY,
  SAMPLE_REPAIR_REQUESTS,
  SAMPLE_CONSTRAINTS_LOG_READ_MODEL,
  SAMPLE_CONSTRAINTS_LOG_RISKS,
  SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS,
  SAMPLE_PROJECT_LIFECYCLE_EVENT,
  SAMPLE_PROJECT_MEMORY_RECORD,
  SAMPLE_PROJECT_DECISION_RECORD,
  SAMPLE_PROJECT_ASSUMPTION_RECORD,
  SAMPLE_PROJECT_STAGE_LENS,
  SAMPLE_WARRANTY_TRACE_RECORD,
  SAMPLE_CROSS_PROJECT_REFERENCE,
  SAMPLE_PROJECT_KNOWLEDGE_REFERENCE,
  SAMPLE_UNIFIED_SEARCH_GROUNDED_RESPONSE,
  SAMPLE_UNIFIED_SEARCH_REFUSAL_RESPONSE,
} from './index.js';
import { SEVERITY_BAND_KEYS } from '../ConstraintsLog.js';
import { REPAIR_REQUEST_STATES } from '../RepairRequests.js';
import { LAUNCH_LINK_STATES } from '../ExternalSystems.js';
import { BUSINESS_AUDIT_SOURCE_CONTEXT_TYPES } from '../BusinessAuditEvent.js';

const FIXTURES_DIR = fileURLToPath(new URL('.', import.meta.url));

const NAMED_FIXTURES: ReadonlyArray<readonly [string, unknown]> = [
  ['SAMPLE_PROJECT_PROFILE', SAMPLE_PROJECT_PROFILE],
  ['SAMPLE_PROJECT_PROFILE_PRECONSTRUCTION', SAMPLE_PROJECT_PROFILE_PRECONSTRUCTION],
  ['SAMPLE_PROJECT_PROFILES', SAMPLE_PROJECT_PROFILES],
  ['SAMPLE_PRIORITY_ACTIONS', SAMPLE_PRIORITY_ACTIONS],
  ['SAMPLE_WORKFLOW_ITEMS', SAMPLE_WORKFLOW_ITEMS],
  ['SAMPLE_WORKFLOW_ITEM_ASSIGNMENTS', SAMPLE_WORKFLOW_ITEM_ASSIGNMENTS],
  ['SAMPLE_WORKFLOW_ITEM_ASSIGNMENT_HISTORY', SAMPLE_WORKFLOW_ITEM_ASSIGNMENT_HISTORY],
  ['SAMPLE_WORKFLOW_ITEM_TRANSITIONS', SAMPLE_WORKFLOW_ITEM_TRANSITIONS],
  ['SAMPLE_APPROVAL_CHECKPOINTS', SAMPLE_APPROVAL_CHECKPOINTS],
  ['SAMPLE_REVIEWER_ACTIONS', SAMPLE_REVIEWER_ACTIONS],
  ['SAMPLE_BUSINESS_AUDIT_EVENTS', SAMPLE_BUSINESS_AUDIT_EVENTS],
  ['SAMPLE_COMMENTS', SAMPLE_COMMENTS],
  ['SAMPLE_COMMENT_HISTORY', SAMPLE_COMMENT_HISTORY],
  ['SAMPLE_EXTERNAL_SYSTEM_LINKS', SAMPLE_EXTERNAL_SYSTEM_LINKS],
  ['SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS', SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS],
  ['SAMPLE_LAUNCH_LINKS', SAMPLE_LAUNCH_LINKS],
  ['SAMPLE_DOCUMENT_CONTROL_SOURCE_IDS', SAMPLE_DOCUMENT_CONTROL_SOURCE_IDS],
  ['SAMPLE_TEAM_ACCESS_MEMBERS', SAMPLE_TEAM_ACCESS_MEMBERS],
  ['SAMPLE_TEAM_ACCESS_VIEWER_LANE', SAMPLE_TEAM_ACCESS_VIEWER_LANE],
  ['SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE', SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE],
  ['SAMPLE_TEAM_ACCESS_ACCESS_MANAGER_LANE', SAMPLE_TEAM_ACCESS_ACCESS_MANAGER_LANE],
  ['SAMPLE_TEAM_ACCESS_PREVIEW_MODEL', SAMPLE_TEAM_ACCESS_PREVIEW_MODEL],
  ['SAMPLE_SITE_HEALTH_CHECKS', SAMPLE_SITE_HEALTH_CHECKS],
  ['SAMPLE_DRIFT_INDICATORS', SAMPLE_DRIFT_INDICATORS],
  ['SAMPLE_SITE_HEALTH_SUMMARY', SAMPLE_SITE_HEALTH_SUMMARY],
  ['SAMPLE_REPAIR_REQUESTS', SAMPLE_REPAIR_REQUESTS],
  ['SAMPLE_CONSTRAINTS_LOG_READ_MODEL', SAMPLE_CONSTRAINTS_LOG_READ_MODEL],
  ['SAMPLE_PROJECT_LIFECYCLE_EVENT', SAMPLE_PROJECT_LIFECYCLE_EVENT],
  ['SAMPLE_PROJECT_MEMORY_RECORD', SAMPLE_PROJECT_MEMORY_RECORD],
  ['SAMPLE_PROJECT_DECISION_RECORD', SAMPLE_PROJECT_DECISION_RECORD],
  ['SAMPLE_PROJECT_ASSUMPTION_RECORD', SAMPLE_PROJECT_ASSUMPTION_RECORD],
  ['SAMPLE_PROJECT_STAGE_LENS', SAMPLE_PROJECT_STAGE_LENS],
  ['SAMPLE_WARRANTY_TRACE_RECORD', SAMPLE_WARRANTY_TRACE_RECORD],
  ['SAMPLE_CROSS_PROJECT_REFERENCE', SAMPLE_CROSS_PROJECT_REFERENCE],
  ['SAMPLE_PROJECT_KNOWLEDGE_REFERENCE', SAMPLE_PROJECT_KNOWLEDGE_REFERENCE],
  ['SAMPLE_UNIFIED_SEARCH_GROUNDED_RESPONSE', SAMPLE_UNIFIED_SEARCH_GROUNDED_RESPONSE],
  ['SAMPLE_UNIFIED_SEARCH_REFUSAL_RESPONSE', SAMPLE_UNIFIED_SEARCH_REFUSAL_RESPONSE],
];

const TENANT_LIVE_URL_PATTERN = /https?:\/\/(?!example\.invalid)[^\s'"`]+/g;
const SUSPICIOUS_UPN_PATTERN = /[A-Za-z0-9._-]+@(?!example\.com\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const NON_DETERMINISTIC_PATTERNS = [
  /Math\.random\s*\(/,
  /Date\.now\s*\(/,
  /\bcrypto\.randomUUID\s*\(/,
  /performance\.now\s*\(/,
];

function listFixtureSources(dir: string): readonly string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isFile() && entry.endsWith('.ts') && !entry.endsWith('.test.ts')) {
      out.push(full);
    }
  }
  return out;
}

describe('PCC fixtures', () => {
  it('every named fixture is free of forbidden keys and value patterns', () => {
    for (const [name, fixture] of NAMED_FIXTURES) {
      const violations = findForbiddenFixtureKeys(fixture);
      expect(violations, `${name} produced violations: ${violations.join(', ')}`).toEqual([]);
    }
  });

  it('PCC_FIXTURES aggregate is also clean', () => {
    expect(findForbiddenFixtureKeys(PCC_FIXTURES)).toEqual([]);
  });

  it('fixture source files use only deterministic identifier patterns', () => {
    for (const sourcePath of listFixtureSources(FIXTURES_DIR)) {
      const contents = readFileSync(sourcePath, 'utf8');
      for (const pattern of NON_DETERMINISTIC_PATTERNS) {
        expect(contents, `${sourcePath} matched ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it('fixture sources only use example.invalid URLs', () => {
    for (const sourcePath of listFixtureSources(FIXTURES_DIR)) {
      const contents = readFileSync(sourcePath, 'utf8');
      const urls = contents.match(TENANT_LIVE_URL_PATTERN) ?? [];
      expect(urls, `${sourcePath} contained non-example.invalid URL(s): ${urls.join(', ')}`).toEqual([]);
    }
  });

  it('fixture sources only use example.com synthetic UPNs', () => {
    for (const sourcePath of listFixtureSources(FIXTURES_DIR)) {
      const contents = readFileSync(sourcePath, 'utf8');
      const upns = contents.match(SUSPICIOUS_UPN_PATTERN) ?? [];
      expect(upns, `${sourcePath} contained non-example.com UPN(s): ${upns.join(', ')}`).toEqual([]);
    }
  });

  it('SAMPLE_REPAIR_REQUESTS covers all six repair-request states', () => {
    const observed = new Set(SAMPLE_REPAIR_REQUESTS.map((r) => r.state));
    for (const state of REPAIR_REQUEST_STATES) {
      expect(observed.has(state)).toBe(true);
    }
  });

  it('SAMPLE_LAUNCH_LINKS covers both configured and missing branches', () => {
    const observed = new Set(SAMPLE_LAUNCH_LINKS.map((l) => l.state));
    for (const state of LAUNCH_LINK_STATES) {
      expect(observed.has(state)).toBe(true);
    }
  });

  it('SAMPLE_BUSINESS_AUDIT_EVENTS covers both source-context branches', () => {
    const observed = new Set(
      SAMPLE_BUSINESS_AUDIT_EVENTS.map((e) => e.sourceContext?.type).filter(
        (t): t is (typeof BUSINESS_AUDIT_SOURCE_CONTEXT_TYPES)[number] => t !== undefined,
      ),
    );
    for (const ctxType of BUSINESS_AUDIT_SOURCE_CONTEXT_TYPES) {
      expect(observed.has(ctxType)).toBe(true);
    }
  });

  it('SAMPLE_SITE_HEALTH_CHECKS covers all four check-state values', () => {
    const observed = new Set(SAMPLE_SITE_HEALTH_CHECKS.map((c) => c.state));
    for (const state of ['pass', 'fail', 'warning', 'not-run'] as const) {
      expect(observed.has(state)).toBe(true);
    }
  });

  it('SAMPLE_CONSTRAINTS_LOG_READ_MODEL covers every severity band on both risks and constraints', () => {
    // Risk band coverage uses the initial assessment so the residual-
    // reduction scenario (high → moderate with mitigation rationale) is
    // independent from the band-coverage requirement.
    const riskBands = new Set(SAMPLE_CONSTRAINTS_LOG_RISKS.map((r) => r.initial.band));
    const constraintBands = new Set(SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS.map((c) => c.exposure.band));
    for (const band of SEVERITY_BAND_KEYS) {
      expect(riskBands.has(band), `risk band coverage missing: ${band}`).toBe(true);
      expect(constraintBands.has(band), `constraint band coverage missing: ${band}`).toBe(true);
    }
    expect(SAMPLE_CONSTRAINTS_LOG_READ_MODEL.moduleIdentity.moduleId).toBe('constraints-log');
  });
});
