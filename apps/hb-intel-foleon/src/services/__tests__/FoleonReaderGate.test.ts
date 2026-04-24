import { describe, expect, it } from 'vitest';
import { evaluateFoleonReaderGate } from '../FoleonReaderGate.js';
import { createFoleonOriginPolicy } from '../FoleonOriginPolicy.js';
import type { FoleonContentRecord } from '../../types/foleon-content.types.js';

const policy = createFoleonOriginPolicy(['https://viewer.us.foleon.com']);

function makeRecord(overrides: Partial<FoleonContentRecord> = {}): FoleonContentRecord {
  return {
    id: 1,
    title: 'Test',
    foleonDocId: 123456,
    contentTypeKey: 'Project Highlight',
    publishStatus: 'Published',
    isVisible: true,
    isFeatured: false,
    isHomepageEligible: true,
    openMode: 'Inline Reader',
    allowEmbed: true,
    requiresExternalOpen: false,
    publishedUrl: 'https://viewer.us.foleon.com/published/9y5ovw5h3q9ky9/',
    syncSource: 'Manual',
    ...overrides,
  };
}

describe('evaluateFoleonReaderGate', () => {
  it('allows an embeddable published record on an allowlisted origin', () => {
    const result = evaluateFoleonReaderGate(makeRecord(), policy);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('ok');
    expect(result.embedUrl).toBe('https://viewer.us.foleon.com/published/9y5ovw5h3q9ky9/');
  });

  it('rejects a missing record', () => {
    expect(evaluateFoleonReaderGate(undefined, policy).reason).toBe('missing-record');
  });

  it('rejects when IsVisible is false', () => {
    expect(evaluateFoleonReaderGate(makeRecord({ isVisible: false }), policy).reason).toBe(
      'not-visible',
    );
  });

  it('rejects unpublished status', () => {
    expect(
      evaluateFoleonReaderGate(makeRecord({ publishStatus: 'Draft' }), policy).reason,
    ).toBe('not-published');
  });

  it('rejects embed-disallowed records', () => {
    expect(evaluateFoleonReaderGate(makeRecord({ allowEmbed: false }), policy).reason).toBe(
      'embed-disallowed',
    );
  });

  it('rejects records flagged requires-external-open', () => {
    expect(
      evaluateFoleonReaderGate(makeRecord({ requiresExternalOpen: true }), policy).reason,
    ).toBe('requires-external-open');
  });

  it('rejects records with no URL', () => {
    expect(
      evaluateFoleonReaderGate(
        makeRecord({ publishedUrl: undefined, embedUrl: undefined }),
        policy,
      ).reason,
    ).toBe('no-url');
  });

  it('prefers embedUrl over publishedUrl', () => {
    const result = evaluateFoleonReaderGate(
      makeRecord({ embedUrl: 'https://viewer.us.foleon.com/embed/xyz/' }),
      policy,
    );
    expect(result.allowed).toBe(true);
    expect(result.embedUrl).toBe('https://viewer.us.foleon.com/embed/xyz/');
  });

  it('rejects a preview URL under default policy', () => {
    expect(
      evaluateFoleonReaderGate(
        makeRecord({ publishedUrl: 'https://viewer.us.foleon.com/preview/xyz/' }),
        policy,
      ).reason,
    ).toBe('preview-url-blocked');
  });

  it('rejects a non-allowlisted origin', () => {
    expect(
      evaluateFoleonReaderGate(
        makeRecord({ publishedUrl: 'https://viewer.eu.foleon.com/published/xyz/' }),
        policy,
      ).reason,
    ).toBe('origin-not-allowlisted');
  });

  it('rejects a display window starting in the future', () => {
    const futureDate = new Date('2099-01-01T00:00:00Z').toISOString();
    expect(
      evaluateFoleonReaderGate(makeRecord({ displayFrom: futureDate }), policy, new Date('2026-04-24')).reason,
    ).toBe('display-window-future');
  });

  it('rejects a display window already ended', () => {
    expect(
      evaluateFoleonReaderGate(
        makeRecord({ displayThrough: '2020-01-01T00:00:00Z' }),
        policy,
        new Date('2026-04-24'),
      ).reason,
    ).toBe('display-window-past');
  });

  it('permits a record inside a valid display window', () => {
    const result = evaluateFoleonReaderGate(
      makeRecord({
        displayFrom: '2020-01-01T00:00:00Z',
        displayThrough: '2099-01-01T00:00:00Z',
      }),
      policy,
      new Date('2026-04-24'),
    );
    expect(result.allowed).toBe(true);
  });
});
