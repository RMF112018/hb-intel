import { describe, expect, it } from 'vitest';

import {
  MY_PROJECT_LINK_WARNING_CODES,
  type MyProjectLinkWarningCode,
  type MyWorkReadModelEnvelope,
  type MyProjectLinksReadModel,
} from '../index.js';

import {
  MY_PROJECT_LINKS_AVAILABLE,
  MY_PROJECT_LINKS_BACKEND_UNAVAILABLE,
  MY_PROJECT_LINKS_BOUNDED_SOURCE_PARTIAL_WARNING,
  MY_PROJECT_LINKS_MIXED_ACTION_AVAILABILITY,
  MY_PROJECT_LINKS_MORE_THAN_SIX_ITEMS,
  MY_PROJECT_LINKS_NO_ASSIGNED_PROJECTS,
  MY_PROJECT_LINKS_PARTIAL_SOURCE_READINESS,
  MY_PROJECT_LINKS_PRINCIPAL_UNRESOLVED,
  MY_PROJECT_LINKS_SOURCE_UNAVAILABLE,
} from './myProjectLinksReadModels.js';

const ALL: ReadonlyArray<readonly [string, MyWorkReadModelEnvelope<MyProjectLinksReadModel>]> = [
  ['available', MY_PROJECT_LINKS_AVAILABLE],
  ['more-than-six-items', MY_PROJECT_LINKS_MORE_THAN_SIX_ITEMS],
  ['mixed-action-availability', MY_PROJECT_LINKS_MIXED_ACTION_AVAILABILITY],
  ['no-assigned-projects', MY_PROJECT_LINKS_NO_ASSIGNED_PROJECTS],
  ['partial-source-readiness', MY_PROJECT_LINKS_PARTIAL_SOURCE_READINESS],
  ['source-unavailable', MY_PROJECT_LINKS_SOURCE_UNAVAILABLE],
  ['principal-unresolved', MY_PROJECT_LINKS_PRINCIPAL_UNRESOLVED],
  ['backend-unavailable', MY_PROJECT_LINKS_BACKEND_UNAVAILABLE],
  ['bounded-source-partial-warning', MY_PROJECT_LINKS_BOUNDED_SOURCE_PARTIAL_WARNING],
];

describe('project-links fixtures', () => {
  it('exposes all required scenarios', () => {
    expect(ALL.map(([name]) => name)).toEqual([
      'available',
      'more-than-six-items',
      'mixed-action-availability',
      'no-assigned-projects',
      'partial-source-readiness',
      'source-unavailable',
      'principal-unresolved',
      'backend-unavailable',
      'bounded-source-partial-warning',
    ]);
  });

  it.each(ALL)('%s envelope carries deterministic contract fields', (_name, envelope) => {
    expect(envelope.mode).toBe('fixture');
    expect(envelope.readOnly).toBe(true);
    expect(envelope.data.moduleId).toBe('my-project-links');
    expect(envelope.data.actor.principalName).toBe('avery.lead@hb.example.com');
  });

  it('available fixture mixes projects-only, merged, and legacy-only items', () => {
    const sources = MY_PROJECT_LINKS_AVAILABLE.data.items.map((item) => item.source);
    expect(sources).toContain('projects-only');
    expect(sources).toContain('merged');
    expect(sources).toContain('legacy-only');
    expect(MY_PROJECT_LINKS_AVAILABLE.data.summary.dualLaunchReadyCount).toBeGreaterThan(0);
  });

  it('more-than-six-items fixture provides 7 ordered items', () => {
    expect(MY_PROJECT_LINKS_MORE_THAN_SIX_ITEMS.data.items).toHaveLength(7);
    expect(MY_PROJECT_LINKS_MORE_THAN_SIX_ITEMS.data.items[0]?.projectNumber).toBe('24-100-01');
    expect(MY_PROJECT_LINKS_MORE_THAN_SIX_ITEMS.data.items[6]?.projectNumber).toBe('24-100-06');
  });

  it('mixed-action-availability fixture carries opposite launch-availability cases', () => {
    const items = MY_PROJECT_LINKS_MIXED_ACTION_AVAILABILITY.data.items;
    expect(items.some((item) => item.sharePointAction.state === 'available' && item.procoreAction.state === 'unavailable')).toBe(true);
    expect(items.some((item) => item.sharePointAction.state === 'unavailable' && item.procoreAction.state === 'available')).toBe(true);
  });

  it('bounded-source partial fixture includes bounded warning vocabulary', () => {
    const itemCodes = MY_PROJECT_LINKS_BOUNDED_SOURCE_PARTIAL_WARNING.data.items[0]!.warnings.map(
      (warning) => warning.code,
    );
    const codes = new Set(itemCodes);
    expect(codes).toContain('assignment-source-bounded');
    expect(codes).toContain('schema-transition-legacy-role-fallback-used');
  });

  it('all item warnings are from project-links warning vocabulary', () => {
    const codeSet = new Set(MY_PROJECT_LINK_WARNING_CODES);
    for (const [, envelope] of ALL) {
      for (const item of envelope.data.items) {
        for (const warning of item.warnings) {
          expect(codeSet.has(warning.code)).toBe(true);
        }
      }
    }
  });

  it('project-links warning code type accepts all declared values', () => {
    for (const code of MY_PROJECT_LINK_WARNING_CODES) {
      const typedCode: MyProjectLinkWarningCode = code;
      expect(typedCode).toBe(code);
    }
  });
});
