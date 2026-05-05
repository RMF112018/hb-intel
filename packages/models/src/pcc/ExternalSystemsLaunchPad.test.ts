import { describe, expect, it } from 'vitest';
import {
  EXTERNAL_LAUNCHER_TYPE_REGISTRY,
  EXTERNAL_LAUNCHER_TYPES,
  EXTERNAL_REVIEW_STATES,
  EXTERNAL_SYSTEM_ACTION_IDS,
  EXTERNAL_SYSTEM_AUDIT_EVENT_TYPES,
  EXTERNAL_SYSTEM_CATEGORIES,
  EXTERNAL_SYSTEM_DEGRADED_STATE_MATRIX,
  EXTERNAL_SYSTEM_DEGRADED_STATES,
  EXTERNAL_SYSTEM_KEYS,
  EXTERNAL_SYSTEM_LIVE_READ_POSTURES,
  EXTERNAL_SYSTEM_MAPPING_STATES,
  EXTERNAL_SYSTEM_MVP_MODES,
  EXTERNAL_SYSTEM_POSTURE_KINDS,
  EXTERNAL_SYSTEM_REGISTRY,
  EXTERNAL_SYSTEM_ROLE_IDS,
  EXTERNAL_SYSTEM_SOURCE_HEALTH_STATES,
  EXTERNAL_SYSTEM_WRITEBACK_POLICIES,
  HBI_ALLOWED_CAPABILITIES,
  HBI_REFUSAL_REASON_CODES,
  HBI_REFUSED_CAPABILITIES,
  HBI_SOURCE_LINEAGE_STATES,
  PROJECT_EXTERNAL_LINK_APPROVAL_STATES,
  type ExternalSystemKey,
} from './ExternalSystemsLaunchPad.js';

describe('Wave 15 vocabulary tuples — verbatim canonical members', () => {
  it('EXTERNAL_SYSTEM_KEYS lists 23 hyphen-keyed systems', () => {
    expect([...EXTERNAL_SYSTEM_KEYS]).toEqual([
      'sharepoint',
      'onedrive',
      'teams',
      'outlook-calendar',
      'procore',
      'sage-intacct',
      'timberscan',
      'compass',
      'document-crunch',
      'adobe-sign',
      'docusign',
      'autodesk-acc',
      'unanet',
      'permitting',
      'truelook',
      'earthcam',
      'oxblue',
      'sensera-sitecloud',
      'evercam',
      'openspace',
      'dronedeploy',
      'cupix',
      'custom-link',
    ]);
  });

  it('EXTERNAL_SYSTEM_CATEGORIES lists 13 categories', () => {
    expect([...EXTERNAL_SYSTEM_CATEGORIES]).toEqual([
      'microsoft-365',
      'project-management',
      'accounting',
      'prequalification',
      'contract-analysis',
      'esignature',
      'design-construction-platform',
      'crm-business-development',
      'permitting',
      'progress-camera',
      'reality-capture',
      'drone-reality-capture',
      'custom',
    ]);
  });

  it('EXTERNAL_SYSTEM_POSTURE_KINDS lists 5 posture kinds', () => {
    expect([...EXTERNAL_SYSTEM_POSTURE_KINDS]).toEqual([
      'mvp-required',
      'mvp-optional',
      'conditional',
      'project-configurable',
      'project-configurable-approval-gated',
    ]);
  });

  it('EXTERNAL_SYSTEM_MVP_MODES lists 6 modes', () => {
    expect(EXTERNAL_SYSTEM_MVP_MODES).toHaveLength(6);
  });

  it('EXTERNAL_SYSTEM_LIVE_READ_POSTURES lists 3 postures', () => {
    expect([...EXTERNAL_SYSTEM_LIVE_READ_POSTURES]).toEqual([
      'backend-mediated-future-gated',
      'future-gated',
      'not-authorized',
    ]);
  });

  it('EXTERNAL_SYSTEM_WRITEBACK_POLICIES contains only "prohibited"', () => {
    expect([...EXTERNAL_SYSTEM_WRITEBACK_POLICIES]).toEqual(['prohibited']);
  });

  it('EXTERNAL_LAUNCHER_TYPES lists 6 launcher families verbatim', () => {
    expect([...EXTERNAL_LAUNCHER_TYPES]).toEqual([
      'system',
      'ahj-portal',
      'private-provider-portal',
      'progress-camera',
      'custom',
      'accounting',
    ]);
  });

  it('PROJECT_EXTERNAL_LINK_APPROVAL_STATES lists 7 states', () => {
    expect([...PROJECT_EXTERNAL_LINK_APPROVAL_STATES]).toEqual([
      'draft',
      'submitted',
      'approved',
      'rejected',
      'blocked-by-policy',
      'archived',
      'superseded',
    ]);
  });

  it('EXTERNAL_SYSTEM_MAPPING_STATES lists 8 states', () => {
    expect([...EXTERNAL_SYSTEM_MAPPING_STATES]).toEqual([
      'not-mapped',
      'mapped',
      'stale',
      'conflict',
      'missing',
      'review-required',
      'blocked',
      'confirmed',
    ]);
  });

  it('EXTERNAL_SYSTEM_SOURCE_HEALTH_STATES lists 9 states', () => {
    expect([...EXTERNAL_SYSTEM_SOURCE_HEALTH_STATES]).toEqual([
      'healthy',
      'warning',
      'degraded',
      'unavailable',
      'missing-config',
      'access-denied',
      'throttled',
      'stale',
      'unknown',
    ]);
  });

  it('EXTERNAL_SYSTEM_DEGRADED_STATES lists 9 states verbatim from the matrix', () => {
    expect([...EXTERNAL_SYSTEM_DEGRADED_STATES]).toEqual([
      'available',
      'backend-unavailable',
      'source-unavailable',
      'missing-config',
      'stale',
      'unauthorized',
      'forbidden',
      'mapping-conflict',
      'blocked-by-policy',
    ]);
  });

  it('EXTERNAL_REVIEW_STATES lists 4 review states', () => {
    expect([...EXTERNAL_REVIEW_STATES]).toEqual(['pending', 'in-progress', 'closed', 'suppressed']);
  });

  it('EXTERNAL_SYSTEM_AUDIT_EVENT_TYPES lists 18 event types verbatim', () => {
    expect([...EXTERNAL_SYSTEM_AUDIT_EVENT_TYPES]).toEqual([
      'launch-pad-rendered',
      'launch-link-rendered',
      'launch-attempted',
      'launch-blocked',
      'project-link-created',
      'project-link-submitted',
      'project-link-approved',
      'project-link-rejected',
      'project-link-archived',
      'mapping-review-created',
      'mapping-correction-requested',
      'mapping-confirmed',
      'mapping-conflict-detected',
      'source-health-changed',
      'admin-verification-created',
      'review-item-closed',
      'hbi-lineage-cited',
      'hbi-refusal-issued',
    ]);
  });

  it('HBI_SOURCE_LINEAGE_STATES lists 6 lineage states', () => {
    expect([...HBI_SOURCE_LINEAGE_STATES]).toEqual([
      'loading',
      'citation-ready',
      'refusal',
      'unavailable',
      'unauthorized',
      'insufficient-evidence',
    ]);
  });

  it('HBI_REFUSAL_REASON_CODES lists 5 refusal codes', () => {
    expect([...HBI_REFUSAL_REASON_CODES]).toEqual([
      'approve-custom-link',
      'change-procore-sage-ahj-camera-system',
      'post-to-sage',
      'make-legal-accounting-claim',
      'bypass-user-access-or-redaction',
    ]);
  });

  it('EXTERNAL_SYSTEM_ROLE_IDS includes 23 roles ending with hbi', () => {
    expect(EXTERNAL_SYSTEM_ROLE_IDS).toHaveLength(24);
    expect(EXTERNAL_SYSTEM_ROLE_IDS[EXTERNAL_SYSTEM_ROLE_IDS.length - 1]).toBe('hbi');
  });

  it('EXTERNAL_SYSTEM_ACTION_IDS lists 28 actions including the URL-policy management gate', () => {
    expect([...EXTERNAL_SYSTEM_ACTION_IDS]).toContain('manage-url-policy');
    expect([...EXTERNAL_SYSTEM_ACTION_IDS]).toContain('approve-custom-link');
    expect([...EXTERNAL_SYSTEM_ACTION_IDS]).toContain('view-launch-pad');
  });

  it('HBI_ALLOWED_CAPABILITIES + HBI_REFUSED_CAPABILITIES are disjoint sets', () => {
    const allowed = new Set<string>(HBI_ALLOWED_CAPABILITIES);
    for (const refused of HBI_REFUSED_CAPABILITIES) {
      expect(allowed.has(refused)).toBe(false);
    }
  });
});

describe('EXTERNAL_SYSTEM_REGISTRY — registry parity with vocabulary', () => {
  it('has a registry entry for every system key', () => {
    for (const key of EXTERNAL_SYSTEM_KEYS) {
      expect(EXTERNAL_SYSTEM_REGISTRY[key]).toBeDefined();
      expect(EXTERNAL_SYSTEM_REGISTRY[key].systemKey).toBe(key);
    }
  });

  it('every registry entry uses a category from the canonical category tuple', () => {
    const categories = new Set<string>(EXTERNAL_SYSTEM_CATEGORIES);
    for (const key of EXTERNAL_SYSTEM_KEYS) {
      expect(categories.has(EXTERNAL_SYSTEM_REGISTRY[key].category)).toBe(true);
    }
  });

  it('every registry entry uses a posture/mvpMode/liveReadPosture from canonical tuples', () => {
    const postures = new Set<string>(EXTERNAL_SYSTEM_POSTURE_KINDS);
    const modes = new Set<string>(EXTERNAL_SYSTEM_MVP_MODES);
    const liveReadPostures = new Set<string>(EXTERNAL_SYSTEM_LIVE_READ_POSTURES);
    for (const key of EXTERNAL_SYSTEM_KEYS) {
      const entry = EXTERNAL_SYSTEM_REGISTRY[key];
      expect(postures.has(entry.posture)).toBe(true);
      expect(modes.has(entry.mvpMode)).toBe(true);
      expect(liveReadPostures.has(entry.liveReadPosture)).toBe(true);
    }
  });

  it('every registry entry has writebackPolicy="prohibited"', () => {
    for (const key of EXTERNAL_SYSTEM_KEYS) {
      expect(EXTERNAL_SYSTEM_REGISTRY[key].writebackPolicy).toBe('prohibited');
    }
  });
});

describe('EXTERNAL_LAUNCHER_TYPE_REGISTRY — launcher parity', () => {
  it('has one entry per launcher type', () => {
    const declaredTypes = EXTERNAL_LAUNCHER_TYPE_REGISTRY.map((entry) => entry.type);
    expect([...declaredTypes].sort()).toEqual([...EXTERNAL_LAUNCHER_TYPES].slice().sort());
  });

  it('only the "custom" launcher type requires approval', () => {
    for (const entry of EXTERNAL_LAUNCHER_TYPE_REGISTRY) {
      if (entry.type === 'custom') {
        expect(entry.approvalRequired).toBe(true);
        expect(entry.requiredApproverRoles).toEqual(['project-manager', 'project-executive']);
      } else {
        expect(entry.approvalRequired).toBe(false);
      }
    }
  });
});

describe('EXTERNAL_SYSTEM_DEGRADED_STATE_MATRIX — verbatim parity with artifact', () => {
  it('has an entry for every degraded state', () => {
    for (const state of EXTERNAL_SYSTEM_DEGRADED_STATES) {
      expect(EXTERNAL_SYSTEM_DEGRADED_STATE_MATRIX[state]).toBeDefined();
    }
  });

  it('mirrors the canonical user copy for backend-unavailable and blocked-by-policy', () => {
    expect(EXTERNAL_SYSTEM_DEGRADED_STATE_MATRIX['backend-unavailable'].userCopy).toBe(
      'Launch Pad data is temporarily unavailable.',
    );
    expect(EXTERNAL_SYSTEM_DEGRADED_STATE_MATRIX['blocked-by-policy'].userCopy).toBe(
      'This link or system is blocked by policy.',
    );
  });

  it('every entry instructs HBI to refuse, redact, or stay within citations only', () => {
    const matrix = EXTERNAL_SYSTEM_DEGRADED_STATE_MATRIX;
    expect(matrix['backend-unavailable'].hbiBehavior).toContain('Refuse');
    expect(matrix.unauthorized.hbiBehavior).toContain('Must not reveal');
    expect(matrix.forbidden.hbiBehavior).toContain('Must not bypass');
    expect(matrix['blocked-by-policy'].hbiBehavior).toContain('Must not provide workaround');
  });
});

describe('Type-level discriminators (compile-only smoke checks)', () => {
  it('ExternalSystemKey type narrows with the tuple', () => {
    const key: ExternalSystemKey = 'procore';
    expect(EXTERNAL_SYSTEM_KEYS).toContain(key);
  });
});
