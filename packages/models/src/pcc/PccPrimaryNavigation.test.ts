import { describe, it, expect } from 'vitest';
import {
  PCC_MODULE_IDS,
  PCC_MODULE_STATE_COPY,
  PCC_MODULE_STATES,
  PCC_NAVIGATION_MODULES,
  PCC_PRIMARY_NAVIGATION_TABS,
  PCC_PRIMARY_TAB_IDS,
  getModule,
  getModulesForPrimaryTab,
  getParentTabForModule,
  getPrimaryNavigationTab,
  isSelectableModule,
  normalizeModuleId,
  normalizePrimaryTabId,
  type PccModuleId,
  type PccModuleState,
  type PccNavigationModule,
  type PccPrimaryNavigationTab,
  type PccPrimaryTabId,
} from './PccPrimaryNavigation.js';

const FORBIDDEN_DEVELOPER_TERMS: readonly string[] = [
  'todo',
  'tbd',
  'placeholder',
  'stub',
  'mock',
  'fixture',
  'debug',
  'dev-only',
  'not implemented',
  'lorem',
  'developer',
  'code agent',
  'prompt',
  'repo',
  'test selector',
  'internal only',
];

const EXPECTED_PRIMARY_TAB_IDS: readonly PccPrimaryTabId[] = [
  'project-home',
  'core-tools',
  'documents',
  'estimating-preconstruction',
  'startup-closeout',
  'project-controls',
  'cost-time',
  'systems-administration',
];

const EXPECTED_PRIMARY_TAB_LABELS: ReadonlyMap<PccPrimaryTabId, string> = new Map([
  ['project-home', 'Project Home'],
  ['core-tools', 'Core Tools'],
  ['documents', 'Document Control'],
  ['estimating-preconstruction', 'Estimating & Preconstruction'],
  ['startup-closeout', 'Project Startup & Closeout'],
  ['project-controls', 'Project Controls'],
  ['cost-time', 'Cost & Time'],
  ['systems-administration', 'Systems Administration'],
]);

const EXPECTED_MODULE_STATES: readonly PccModuleState[] = [
  'available',
  'preview',
  'read-only',
  'launch-only',
  'configuration-required',
  'source-unavailable',
  'deferred',
];

const EXPECTED_MODULE_IDS: readonly PccModuleId[] = [
  'action-center',
  'my-responsibilities',
  'today-this-week',
  'hbi-assistant',
  'external-platforms',
  'team-access',
  'project-directory',
  'approvals-checkpoints',
  'primary-documents',
  'document-control-center',
  'drawing-model-center',
  'sharepoint-project-record',
  'my-project-files',
  'procore-documents',
  'document-crunch',
  'adobe-sign',
  'future-estimating-modules',
  'preconstruction-handoff',
  'estimate-assumptions-alternates-exclusions',
  'startup-center',
  'responsibility-matrix',
  'closeout',
  'closeout-turnover-tracker',
  'warranty',
  'lessons-learned',
  'subcontractor-performance',
  'project-controls-center',
  'permits-inspections',
  'contract-compliance',
  'risk-issues-decisions',
  'constraints-log',
  'field-operations',
  'meeting-communication',
  'financial-reporting',
  'schedule-monitor',
  'procurement-buyout',
  'commitment-cost-exposure',
  'site-health',
  'control-center-settings',
  'integration-settings',
  'procore-mapping-sync-health',
  'module-configuration',
];

const escapeRegex = (input: string): string => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const FORBIDDEN_TERM_PATTERNS: ReadonlyArray<{ term: string; pattern: RegExp }> =
  FORBIDDEN_DEVELOPER_TERMS.map((term) => ({
    term,
    pattern: new RegExp(`\\b${escapeRegex(term)}\\b`, 'i'),
  }));

const containsForbiddenTerm = (value: string): string | undefined => {
  for (const { term, pattern } of FORBIDDEN_TERM_PATTERNS) {
    if (pattern.test(value)) {
      return term;
    }
  }
  return undefined;
};

describe('PCC Phase 05 — primary tab + module navigation registry', () => {
  it('PCC_PRIMARY_TAB_IDS is exactly the locked eight-item tuple in order', () => {
    expect([...PCC_PRIMARY_TAB_IDS]).toEqual([...EXPECTED_PRIMARY_TAB_IDS]);
    expect(PCC_PRIMARY_TAB_IDS.length).toBe(8);
  });

  it('PCC_MODULE_STATES is exactly the locked seven-item tuple in order', () => {
    expect([...PCC_MODULE_STATES]).toEqual([...EXPECTED_MODULE_STATES]);
    expect(PCC_MODULE_STATES.length).toBe(7);
  });

  it('PCC_MODULE_IDS is exactly the locked 42-item tuple in order', () => {
    expect([...PCC_MODULE_IDS]).toEqual([...EXPECTED_MODULE_IDS]);
    expect(PCC_MODULE_IDS.length).toBe(42);
  });

  it('PCC_PRIMARY_NAVIGATION_TABS has exactly one record per primary tab id', () => {
    expect(PCC_PRIMARY_NAVIGATION_TABS.length).toBe(PCC_PRIMARY_TAB_IDS.length);
    const seen = new Set<PccPrimaryTabId>();
    for (const id of PCC_PRIMARY_TAB_IDS) {
      const matches = PCC_PRIMARY_NAVIGATION_TABS.filter((tab) => tab.id === id);
      expect(matches.length).toBe(1);
      expect(seen.has(id)).toBe(false);
      seen.add(id);
    }
  });

  it('every primary tab visible label exactly matches the locked label set', () => {
    for (const id of PCC_PRIMARY_TAB_IDS) {
      const tab = getPrimaryNavigationTab(id);
      const expected = EXPECTED_PRIMARY_TAB_LABELS.get(id);
      expect(expected).toBeDefined();
      expect(tab.label).toBe(expected);
    }
  });

  it('the documents primary tab visible label is exactly "Document Control"', () => {
    const tab = getPrimaryNavigationTab('documents');
    expect(tab.label).toBe('Document Control');
    expect(tab.dashboardTitle).toBe('Document Control');
  });

  it('no primary tab visible label is "Documents"', () => {
    for (const id of PCC_PRIMARY_TAB_IDS) {
      const tab = getPrimaryNavigationTab(id);
      expect(tab.label).not.toBe('Documents');
    }
  });

  it('every primary tab has at least one module', () => {
    for (const id of PCC_PRIMARY_TAB_IDS) {
      const tab = getPrimaryNavigationTab(id);
      expect(tab.modules.length).toBeGreaterThan(0);
    }
  });

  it('every module id appears exactly once in PCC_NAVIGATION_MODULES', () => {
    expect(PCC_NAVIGATION_MODULES.length).toBe(PCC_MODULE_IDS.length);
    const counts = new Map<string, number>();
    for (const mod of PCC_NAVIGATION_MODULES) {
      counts.set(mod.id, (counts.get(mod.id) ?? 0) + 1);
    }
    for (const id of PCC_MODULE_IDS) {
      expect(counts.get(id)).toBe(1);
    }
  });

  it('every module parent tab exists in PCC_PRIMARY_TAB_IDS', () => {
    for (const id of PCC_MODULE_IDS) {
      const mod = getModule(id);
      expect(PCC_PRIMARY_TAB_IDS).toContain(mod.parentTabId);
    }
  });

  it('every module listed under a primary tab exists in PCC_MODULE_IDS', () => {
    for (const id of PCC_PRIMARY_TAB_IDS) {
      const tab = getPrimaryNavigationTab(id);
      for (const moduleId of tab.modules) {
        expect(PCC_MODULE_IDS).toContain(moduleId);
      }
    }
  });

  it('every module appears under exactly one primary tab', () => {
    const moduleAppearances = new Map<PccModuleId, number>();
    for (const id of PCC_PRIMARY_TAB_IDS) {
      const tab = getPrimaryNavigationTab(id);
      for (const moduleId of tab.modules) {
        moduleAppearances.set(moduleId, (moduleAppearances.get(moduleId) ?? 0) + 1);
      }
    }
    for (const id of PCC_MODULE_IDS) {
      expect(moduleAppearances.get(id)).toBe(1);
    }
  });

  it('every module state is in PCC_MODULE_STATES', () => {
    for (const id of PCC_MODULE_IDS) {
      const mod = getModule(id);
      expect(PCC_MODULE_STATES).toContain(mod.state);
    }
  });

  it('every module stateLabel matches PCC_MODULE_STATE_COPY[state].stateLabel', () => {
    for (const id of PCC_MODULE_IDS) {
      const mod = getModule(id);
      expect(mod.stateLabel).toBe(PCC_MODULE_STATE_COPY[mod.state].stateLabel);
    }
  });

  it('every non-selectable module has disabledReason', () => {
    for (const id of PCC_MODULE_IDS) {
      const mod = getModule(id);
      if (!mod.selectable) {
        expect(mod.disabledReason).toBeTypeOf('string');
        expect((mod.disabledReason ?? '').length).toBeGreaterThan(0);
      }
    }
  });

  it('every non-selectable module disabledReason equals PCC_MODULE_STATE_COPY[state].reason', () => {
    for (const id of PCC_MODULE_IDS) {
      const mod = getModule(id);
      if (!mod.selectable) {
        expect(mod.disabledReason).toBe(PCC_MODULE_STATE_COPY[mod.state].reason);
      }
    }
  });

  it('every selectable module has no disabledReason', () => {
    for (const id of PCC_MODULE_IDS) {
      const mod = getModule(id);
      if (mod.selectable) {
        expect(mod.disabledReason).toBeUndefined();
      }
    }
  });

  it('every module has non-empty summary, authorityCue, stateLabel, and label', () => {
    for (const id of PCC_MODULE_IDS) {
      const mod = getModule(id);
      expect(mod.label.length).toBeGreaterThan(0);
      expect(mod.summary.length).toBeGreaterThan(0);
      expect(mod.authorityCue.length).toBeGreaterThan(0);
      expect(mod.stateLabel.length).toBeGreaterThan(0);
    }
  });

  it('launch-only modules include no-writeback meaning in authorityCue', () => {
    let launchOnlyCount = 0;
    for (const id of PCC_MODULE_IDS) {
      const mod = getModule(id);
      if (mod.state === 'launch-only') {
        launchOnlyCount += 1;
        const cue = mod.authorityCue.toLowerCase();
        const indicatesNoWriteback =
          cue.includes('does not write back') || cue.includes('no writeback');
        expect(indicatesNoWriteback).toBe(true);
      }
    }
    expect(launchOnlyCount).toBeGreaterThan(0);
  });

  it('HBI Assistant authority copy is advisory and rules out decisions, approvals, and writeback', () => {
    const hbi = getModule('hbi-assistant');
    const cue = hbi.authorityCue.toLowerCase();
    expect(cue).toContain('advisory');
    expect(cue).toContain('no decision');
    expect(cue).toContain('no approval');
    expect(cue.includes('no writeback') || cue.includes('does not write back')).toBe(true);
  });

  it('Approvals & Checkpoints does not expose approve/reject/waive authority in authorityCue', () => {
    const mod = getModule('approvals-checkpoints');
    const cue = mod.authorityCue.toLowerCase();
    expect(cue).not.toContain('approve');
    expect(cue).not.toContain('reject');
    expect(cue).not.toContain('waive');
  });

  it('helper functions return expected records', () => {
    for (const id of PCC_PRIMARY_TAB_IDS) {
      const tab = getPrimaryNavigationTab(id);
      expect(tab.id).toBe(id);
      const modules = getModulesForPrimaryTab(id);
      expect(modules.length).toBe(tab.modules.length);
      modules.forEach((mod, index) => {
        expect(mod.id).toBe(tab.modules[index]);
        expect(mod.parentTabId).toBe(id);
      });
    }
    for (const id of PCC_MODULE_IDS) {
      const mod = getModule(id);
      expect(mod.id).toBe(id);
      expect(getParentTabForModule(id)).toBe(mod.parentTabId);
      expect(isSelectableModule(mod)).toBe(mod.selectable);
    }
  });

  it('normalizePrimaryTabId returns valid input as-is and invalid input as project-home', () => {
    for (const id of PCC_PRIMARY_TAB_IDS) {
      expect(normalizePrimaryTabId(id)).toBe(id);
    }
    expect(normalizePrimaryTabId('not-a-real-tab')).toBe('project-home');
    expect(normalizePrimaryTabId(undefined)).toBe('project-home');
    expect(normalizePrimaryTabId(null)).toBe('project-home');
    expect(normalizePrimaryTabId(42)).toBe('project-home');
    expect(normalizePrimaryTabId({})).toBe('project-home');
  });

  it('normalizeModuleId returns valid input as-is and invalid input as undefined', () => {
    for (const id of PCC_MODULE_IDS) {
      expect(normalizeModuleId(id)).toBe(id);
    }
    expect(normalizeModuleId('not-a-real-module')).toBeUndefined();
    expect(normalizeModuleId(undefined)).toBeUndefined();
    expect(normalizeModuleId(null)).toBeUndefined();
    expect(normalizeModuleId(123)).toBeUndefined();
    expect(normalizeModuleId({})).toBeUndefined();
  });

  it('registry-visible copy contains no forbidden developer terms', () => {
    const offenders: Array<{ field: string; value: string; term: string }> = [];

    const checkField = (field: string, value: string): void => {
      const term = containsForbiddenTerm(value);
      if (term) {
        offenders.push({ field, value, term });
      }
    };

    for (const id of PCC_PRIMARY_TAB_IDS) {
      const tab: PccPrimaryNavigationTab = getPrimaryNavigationTab(id);
      checkField(`primaryTab[${id}].label`, tab.label);
      checkField(`primaryTab[${id}].dashboardTitle`, tab.dashboardTitle);
      checkField(`primaryTab[${id}].dashboardDescription`, tab.dashboardDescription);
    }

    for (const id of PCC_MODULE_IDS) {
      const mod: PccNavigationModule = getModule(id);
      checkField(`module[${id}].label`, mod.label);
      checkField(`module[${id}].summary`, mod.summary);
      checkField(`module[${id}].authorityCue`, mod.authorityCue);
      checkField(`module[${id}].stateLabel`, mod.stateLabel);
      if (mod.disabledReason !== undefined) {
        checkField(`module[${id}].disabledReason`, mod.disabledReason);
      }
    }

    for (const state of PCC_MODULE_STATES) {
      const copy = PCC_MODULE_STATE_COPY[state];
      checkField(`PCC_MODULE_STATE_COPY[${state}].stateLabel`, copy.stateLabel);
      checkField(`PCC_MODULE_STATE_COPY[${state}].reason`, copy.reason);
    }

    expect(offenders).toEqual([]);
  });
});
