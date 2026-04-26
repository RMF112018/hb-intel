import { describe, expect, it } from 'vitest';
import { createFoleonOriginPolicy } from '../../../services/FoleonOriginPolicy.js';
import type { FoleonContentMutation, FoleonManagedContent } from '../../../types/foleon-management.types.js';
import {
  findActiveEditionConflict,
  placementAlignmentWarnings,
  validateFoleonContentWorkflow,
} from '../manageMutationUtils.js';

function draft(overrides: Partial<FoleonContentMutation> = {}): FoleonContentMutation {
  return {
    title: 'Project Spotlight',
    foleonDocId: 1001,
    contentTypeKey: 'Project Spotlight',
    readerKey: 'project-spotlight',
    homepageSlot: 'Project Spotlight Reader',
    activeEdition: true,
    publishStatus: 'Published',
    isVisible: true,
    isHomepageEligible: true,
    publishedUrl: 'https://viewer.us.foleon.com/project/spotlight',
    embedUrl: 'https://viewer.us.foleon.com/project/spotlight/embed',
    openMode: 'Inline Reader',
    allowEmbed: true,
    requiresExternalOpen: false,
    ...overrides,
  };
}

function content(overrides: Partial<FoleonManagedContent> = {}): FoleonManagedContent {
  return {
    id: 'content-1',
    sharePointItemId: 1,
    etag: '"1"',
    title: 'Existing Project Spotlight',
    foleonDocId: 1001,
    contentTypeKey: 'Project Spotlight',
    readerKey: 'project-spotlight',
    homepageSlot: 'Project Spotlight Reader',
    activeEdition: true,
    publishStatus: 'Published',
    isVisible: true,
    isHomepageEligible: true,
    publishedUrl: 'https://viewer.us.foleon.com/project/existing',
    embedUrl: 'https://viewer.us.foleon.com/project/existing/embed',
    validationStatus: 'valid',
    blockingReasons: [],
    openMode: 'Inline Reader',
    allowEmbed: true,
    requiresExternalOpen: false,
    ...overrides,
  };
}

describe('manageMutationUtils workflow validation', () => {
  it('detects active edition conflicts only for overlapping lane and homepage slot windows', () => {
    const conflict = findActiveEditionConflict({
      draft: draft({ displayFrom: '2026-05-01T00:00:00.000Z', displayThrough: '2026-05-31T00:00:00.000Z' }),
      currentSharePointItemId: 2,
      allContent: [content({ displayFrom: '2026-05-15T00:00:00.000Z', displayThrough: '2026-06-01T00:00:00.000Z' })],
    });

    expect(conflict).toContain('Project Spotlight already has an overlapping active edition');
  });

  it('blocks preview URLs when preview promotion is disabled', () => {
    const issues = validateFoleonContentWorkflow({
      draft: draft({ publishedUrl: 'https://viewer.us.foleon.com/preview/project' }),
      allContent: [],
      originPolicy: createFoleonOriginPolicy(['https://viewer.us.foleon.com'], false),
    });

    expect(issues).toContainEqual(expect.objectContaining({
      label: 'Published URL',
      status: 'blocked',
      detail: expect.stringContaining('preview URL'),
    }));
  });

  it('blocks production URLs outside the accepted origin allowlist', () => {
    const issues = validateFoleonContentWorkflow({
      draft: draft({ publishedUrl: 'https://example.com/project' }),
      allContent: [],
      originPolicy: createFoleonOriginPolicy(['https://viewer.us.foleon.com'], false),
    });

    expect(issues).toContainEqual(expect.objectContaining({
      label: 'Published URL',
      status: 'blocked',
      detail: expect.stringContaining('not allowlisted'),
    }));
  });

  it('requires an embed URL for inline reader mode', () => {
    const issues = validateFoleonContentWorkflow({
      draft: draft({ embedUrl: undefined, openMode: 'Inline Reader' }),
      allContent: [],
      originPolicy: createFoleonOriginPolicy(['https://viewer.us.foleon.com'], false),
    });

    expect(issues).toContainEqual(expect.objectContaining({
      label: 'Inline embed URL present',
      status: 'blocked',
    }));
  });

  it('blocks invalid display date ranges', () => {
    const issues = validateFoleonContentWorkflow({
      draft: draft({ displayFrom: '2026-06-01T00:00:00.000Z', displayThrough: '2026-05-01T00:00:00.000Z' }),
      allContent: [],
      originPolicy: createFoleonOriginPolicy(['https://viewer.us.foleon.com'], false),
    });

    expect(issues).toContainEqual(expect.objectContaining({
      label: 'Display window valid',
      status: 'blocked',
    }));
  });

  it('keeps placement validation lane-readable for marketing users', () => {
    const warnings = placementAlignmentWarnings({
      placementKey: 'Company Pulse Active',
      contentItemId: 1,
      content: [content({ contentTypeKey: 'Project Spotlight', readerKey: 'project-spotlight' })],
    });

    expect(warnings).toContain('Company Pulse Active should point to Company Pulse content.');
  });
});
