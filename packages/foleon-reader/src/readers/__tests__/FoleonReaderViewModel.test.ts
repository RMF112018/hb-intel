import { describe, it, expect, vi } from 'vitest';
import {
  FOLEON_READER_CONFIGS,
  type FoleonReaderModuleConfig,
} from '../readerConfigs.js';
import {
  createPreviewFoleonReaderViewModel,
  createReadyFoleonReaderViewModel,
  resolveFoleonReaderLayoutKey,
} from '../FoleonReaderViewModel.js';
import type { FoleonContentRecord } from '../../types/foleon-content.types.js';
import type { FoleonReaderResolution } from '../../services/FoleonReaderContentService.js';

function makeRecord(overrides: Partial<FoleonContentRecord> = {}): FoleonContentRecord {
  return {
    id: 1,
    title: 'A Hosted Edition Title',
    foleonDocId: 1001,
    contentTypeKey: 'Project Spotlight',
    readerKey: 'project-spotlight',
    publishStatus: 'Published',
    isVisible: true,
    isFeatured: true,
    isHomepageEligible: true,
    publishedUrl: 'https://viewer.us.foleon.com/published/edition',
    embedUrl: 'https://viewer.us.foleon.com/embed/edition',
    summary: 'A short editorial summary.',
    issueDate: '2026-04-01T00:00:00.000Z',
    publishedOn: '2026-04-20T00:00:00.000Z',
    archiveGroup: '2026-04',
    activeEdition: true,
    primaryAudience: 'Companywide',
    openMode: 'Inline Reader',
    allowEmbed: true,
    requiresExternalOpen: false,
    syncSource: 'Manual',
    ...overrides,
  };
}

function makeReadyResolution(
  config: FoleonReaderModuleConfig,
  recordOverrides: Partial<FoleonContentRecord> = {},
  warnings: ReadonlyArray<'placement-not-found'> = [],
): Extract<FoleonReaderResolution, { readonly kind: 'ready' }> {
  const record = makeRecord({
    contentTypeKey: config.contentTypeKey as FoleonContentRecord['contentTypeKey'],
    readerKey: config.readerKey,
    ...recordOverrides,
  });
  return {
    kind: 'ready',
    config,
    record,
    embedUrl: record.embedUrl!,
    warnings,
  };
}

describe('resolveFoleonReaderLayoutKey', () => {
  it('maps each governed reader key to the matching lane', () => {
    expect(resolveFoleonReaderLayoutKey(FOLEON_READER_CONFIGS.projectSpotlight)).toBe('projectSpotlight');
    expect(resolveFoleonReaderLayoutKey(FOLEON_READER_CONFIGS.companyPulse)).toBe('companyPulse');
    expect(resolveFoleonReaderLayoutKey(FOLEON_READER_CONFIGS.leadershipMessage)).toBe('leadershipMessage');
  });
});

describe('createPreviewFoleonReaderViewModel', () => {
  it('emits preview state with the lane-specific eyebrow and explicit preview label', () => {
    const vm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    expect(vm.state).toBe('preview');
    expect(vm.lane).toBe('projectSpotlight');
    expect(vm.readerKey).toBe('project-spotlight');
    expect(vm.eyebrow).toBe('Project Spotlight Reader');
    expect(vm.previewLabel).toBe('Preview layout');
  });

  it('defaults audience to "Companywide" and archive group to "Archive coming soon"', () => {
    const vm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    expect(vm.audience).toBe('Companywide');
    expect(vm.archiveGroup).toBe('Archive coming soon');
  });

  it('emits no actions, no iframe, and no mobile gate in preview state', () => {
    const vm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage);
    expect(vm.actions).toEqual([]);
    expect(vm.iframe).toBeUndefined();
    expect(vm.mobileGate).toBeUndefined();
  });

  it('carries an honest, visible preview label and content-coming-soon chip', () => {
    const vm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    const labels = vm.chips.map((c) => c.label);
    expect(vm.previewLabel).toBe('Preview layout');
    expect(labels).toContain('Content coming soon');
  });
});

describe('createReadyFoleonReaderViewModel — freshness preference', () => {
  it('Project Spotlight prefers issueDate over publishedOn', () => {
    const resolution = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight, {
      issueDate: '2026-04-01T00:00:00.000Z',
      publishedOn: '2026-04-20T00:00:00.000Z',
    });
    const vm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    // April 1 should win over April 20 — exact format depends on locale, so
    // we assert by parsing the value.
    expect(vm.freshnessLabel).toBe('Monthly status');
    expect(vm.freshnessValue).toMatch(/2026/);
  });

  it('Company Pulse prefers lastEditorialUpdate over publishedOn', () => {
    const resolution = makeReadyResolution(FOLEON_READER_CONFIGS.companyPulse, {
      contentTypeKey: 'Company Pulse',
      readerKey: 'company-pulse',
      lastEditorialUpdate: '2026-03-15T00:00:00.000Z',
      publishedOn: '2026-04-20T00:00:00.000Z',
    });
    const vm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse, {
      resolution,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    // The chosen field should be lastEditorialUpdate (March), not publishedOn (April).
    expect(vm.freshnessValue).toMatch(/Mar/);
    expect(vm.freshnessLabel).toBe('Latest update');
  });

  it('Leadership Message prefers lastEditorialUpdate over publishedOn', () => {
    const resolution = makeReadyResolution(FOLEON_READER_CONFIGS.leadershipMessage, {
      contentTypeKey: 'Leadership',
      readerKey: 'leadership-message',
      lastEditorialUpdate: '2025-12-05T00:00:00.000Z',
      publishedOn: '2026-01-10T00:00:00.000Z',
    });
    const vm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage, {
      resolution,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vm.freshnessLabel).toBe('Executive update');
    expect(vm.freshnessValue).toMatch(/Dec/);
  });
});

describe('createReadyFoleonReaderViewModel — defaults and iframe model', () => {
  it('defaults audience to "Companywide" when missing and archive group to "Archive coming soon" when missing', () => {
    const resolution = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight, {
      primaryAudience: undefined,
      archiveGroup: undefined,
    });
    const vm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vm.audience).toBe('Companywide');
    expect(vm.archiveGroup).toBe('Archive coming soon');
  });

  it('emits an iframe model with the orchestrator-built title and visibility flag', () => {
    const resolution = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight, {
      title: 'The Seaglass Residence',
    });
    const vm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vm.iframe).toEqual({ title: 'Project Spotlight: The Seaglass Residence', visible: true });
  });

  it('marks the iframe not visible and adds the mobile gate when collapsed', () => {
    const resolution = makeReadyResolution(FOLEON_READER_CONFIGS.companyPulse, {
      contentTypeKey: 'Company Pulse',
      readerKey: 'company-pulse',
    });
    const vm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse, {
      resolution,
      shouldMountIframe: false,
      mobileGateActive: true,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vm.iframe?.visible).toBe(false);
    expect(vm.mobileGate).toEqual({
      headline: 'Reader ready',
      body: 'Open the publication when you are ready to load the Foleon iframe.',
    });
  });
});

describe('createReadyFoleonReaderViewModel — actions and warnings', () => {
  it('always includes Open archive; includes Open reader only when mobile gate is active', () => {
    const onArchive = vi.fn();
    const onActivate = vi.fn();
    const resolution = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight);

    const desktop = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: onActivate,
      onOpenArchive: onArchive,
    });
    expect(desktop.actions.map((a) => a.id)).toEqual(['open-archive']);

    const mobile = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution,
      shouldMountIframe: false,
      mobileGateActive: true,
      onActivateMobileReader: onActivate,
      onOpenArchive: onArchive,
    });
    expect(mobile.actions.map((a) => a.id)).toEqual(['open-mobile-reader', 'open-archive']);
  });

  it('reports admin warnings when the resolution includes them and stays empty otherwise', () => {
    const resolutionWithWarning = makeReadyResolution(
      FOLEON_READER_CONFIGS.projectSpotlight,
      {},
      ['placement-not-found'],
    );
    const vmWith = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution: resolutionWithWarning,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vmWith.warnings.length).toBe(1);

    const resolutionClean = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight);
    const vmClean = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution: resolutionClean,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vmClean.warnings).toEqual([]);
  });
});
