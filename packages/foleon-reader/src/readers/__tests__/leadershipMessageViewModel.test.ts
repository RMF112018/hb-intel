import { describe, it, expect } from 'vitest';
import type { FoleonContentRecord } from '../../types/foleon-content.types.js';
import {
  deriveLeadershipCta,
  deriveLeadershipContextNotes,
  buildLeadershipPreviewSlice,
  type LeadershipViewerTargetInput,
} from '../viewModels/leadershipMessageViewModel.js';

const FORBIDDEN_VM_SUBSTRINGS = [
  'Sample executive byline',
  'Sample role',
  'Sample pull quote',
  'Sample audience',
  'Preview layout',
  'Leadership Message Reader',
  'Leadership Message reader',
  'Cadence',
  'Archive group',
  'Executive byline not provided',
  'not been provided',
  'no-embed-url',
  'embed-not-allowed',
  'requires-external-open',
] as const;

function assertEmployeeFacingLabels(cta: { readonly primaryLabel: string; readonly secondaryLabel?: string }): void {
  const bundle = `${cta.primaryLabel}${cta.secondaryLabel ?? ''}`;
  for (const bad of FORBIDDEN_VM_SUBSTRINGS) {
    expect(bundle.includes(bad)).toBe(false);
  }
}

function baseRecord(overrides: Partial<FoleonContentRecord> = {}): FoleonContentRecord {
  return {
    id: 1,
    title: 'Leadership title',
    foleonDocId: 1,
    contentTypeKey: 'Leadership',
    publishStatus: 'Published',
    isVisible: true,
    isFeatured: false,
    isHomepageEligible: true,
    openMode: 'Inline Reader',
    allowEmbed: true,
    requiresExternalOpen: false,
    syncSource: 'Manual',
    ...overrides,
  };
}

function previewTargetInput(): LeadershipViewerTargetInput {
  return { source: 'preview', renderMode: 'preview', canOpen: true };
}

describe('leadershipMessageViewModel — deriveLeadershipCta', () => {
  it('classifies preview when parent is preview', () => {
    const cta = deriveLeadershipCta('preview', { source: 'active-record', renderMode: 'iframe', canOpen: true });
    expect(cta.kind).toBe('preview');
    assertEmployeeFacingLabels(cta);
  });

  it('classifies preview when target source is preview', () => {
    expect(deriveLeadershipCta('ready', previewTargetInput()).kind).toBe('preview');
  });

  it('classifies external when disabledReason is requires-external-open', () => {
    const cta = deriveLeadershipCta('ready', {
      source: 'active-record',
      renderMode: 'iframe',
      canOpen: false,
      disabledReason: 'requires-external-open',
    });
    expect(cta.kind).toBe('external');
    expect(cta.disabledReason).toBe('requires-external-open');
    expect(cta.primaryLabel).toBe('Open in Foleon');
    expect(cta.secondaryLabel).toContain('new tab');
    assertEmployeeFacingLabels(cta);
  });

  it('classifies live when canOpen is true in iframe ready path', () => {
    expect(
      deriveLeadershipCta('ready', { source: 'active-record', renderMode: 'iframe', canOpen: true }).kind,
    ).toBe('live');
  });

  it.each([
    ['no-embed-url', 'no-embed-url'],
    ['embed-not-allowed', 'embed-not-allowed'],
    ['unknown', 'unknown'],
    ['preview-only', 'preview-only'],
  ] as const)('classifies blocked for %s', (_label, reason) => {
    const cta = deriveLeadershipCta('ready', {
      source: 'active-record',
      renderMode: 'iframe',
      canOpen: false,
      disabledReason: reason,
    });
    expect(cta.kind).toBe('blocked');
    expect(cta.disabledReason).toBe(reason);
    assertEmployeeFacingLabels(cta);
  });
});

describe('leadershipMessageViewModel — deriveLeadershipContextNotes', () => {
  it('does not emit Archive group or Cadence labels', () => {
    const notes = deriveLeadershipContextNotes(
      baseRecord({
        archiveGroup: '2026-Q2',
        primaryAudience: 'Companywide',
        lastEditorialUpdate: '2026-04-10T00:00:00.000Z',
      }),
    );
    const labels = notes.map((n) => n.label).join(' ');
    expect(labels).not.toMatch(/Archive group/i);
    expect(labels).not.toMatch(/Cadence/i);
  });
});

describe('leadershipMessageViewModel — forbidden preview slice strings', () => {
  it('buildLeadershipPreviewSlice never contains forbidden placeholders', () => {
    const slice = buildLeadershipPreviewSlice({
      laneLabel: 'Leadership Message',
      statusLabel: 'Preview edition',
      headline: 'Leadership Message',
      teaser: 'Preview — connect a governed Leadership Message edition.',
      targetInput: previewTargetInput(),
    });
    const serialized = JSON.stringify(slice);
    for (const bad of FORBIDDEN_VM_SUBSTRINGS) {
      expect(serialized.includes(bad)).toBe(false);
    }
  });
});
