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
    expect(vm.eyebrow).toBe('Project Spotlight');
    expect(vm.previewLabel).toBe('Preview');
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
    expect(vm.previewLabel).toBe('Preview');
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
    expect(vm.freshnessLabel).toBe('Featured');
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

describe('view model — Project Spotlight projectFacts and featureCallout', () => {
  it('preview view model populates projectFacts as labeled placeholders only for Project Spotlight', () => {
    const spotlight = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    expect(spotlight.projectFacts).toBeDefined();
    expect(spotlight.projectFacts?.arePlaceholders).toBe(true);
    expect(spotlight.projectFacts?.client).toBe('Sample client');
    expect(spotlight.featureCallout?.heading).toBe("Why we're featuring it");

    const pulse = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const leadership = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage);
    expect(pulse.projectFacts).toBeUndefined();
    expect(pulse.featureCallout).toBeUndefined();
    expect(leadership.projectFacts).toBeUndefined();
    expect(leadership.featureCallout).toBeUndefined();
  });

  it('ready view model derives projectFacts only from FoleonContentRecord (no invented data) and uses arePlaceholders=false', () => {
    const resolution = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight, {
      relatedProjectName: 'Seaglass Holdings LLC',
      region: 'Gulf Coast',
      sector: 'Hospitality',
      // team / milestone source fields not in record schema → adapter leaves
      // `team: undefined`; `milestone` is a date format derived from issueDate.
    });
    const vm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vm.projectFacts).toBeDefined();
    expect(vm.projectFacts?.arePlaceholders).toBe(false);
    expect(vm.projectFacts?.client).toBe('Seaglass Holdings LLC');
    expect(vm.projectFacts?.location).toBe('Gulf Coast');
    expect(vm.projectFacts?.market).toBe('Hospitality');
    expect(vm.projectFacts?.team).toBeUndefined();
    expect(typeof vm.projectFacts?.milestone).toBe('string');
  });

  it('ready view model featureCallout uses record.summary when present and a stable fallback when absent', () => {
    const withSummary = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight, {
      summary: 'A coastal residence redefining HB craft excellence.',
    });
    const vmWith = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution: withSummary,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vmWith.featureCallout?.body).toBe('A coastal residence redefining HB craft excellence.');

    const noSummary = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight, {
      summary: undefined,
    });
    const vmWithout = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution: noSummary,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vmWithout.featureCallout?.body).toMatch(/has not been provided/);
  });

  it('ready view model leaves projectFacts and featureCallout undefined for Pulse and Leadership', () => {
    const pulseRes = makeReadyResolution(FOLEON_READER_CONFIGS.companyPulse, {
      contentTypeKey: 'Company Pulse',
      readerKey: 'company-pulse',
    });
    const leadershipRes = makeReadyResolution(FOLEON_READER_CONFIGS.leadershipMessage, {
      contentTypeKey: 'Leadership',
      readerKey: 'leadership-message',
    });
    const pulseVm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse, {
      resolution: pulseRes,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    const leadershipVm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage, {
      resolution: leadershipRes,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(pulseVm.projectFacts).toBeUndefined();
    expect(pulseVm.featureCallout).toBeUndefined();
    expect(leadershipVm.projectFacts).toBeUndefined();
    expect(leadershipVm.featureCallout).toBeUndefined();
  });
});

describe('view model — Project Spotlight visual-first fields (PS-02)', () => {
  it('preview view model populates projectMedia as a placeholder, ctaLabel, and cadenceLabel only for the projectSpotlight lane', () => {
    const spotlight = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    expect(spotlight.projectMedia).toBeDefined();
    expect(spotlight.projectMedia?.isPlaceholder).toBe(true);
    expect(spotlight.projectMedia?.hasRecordMedia).toBe(false);
    expect(spotlight.ctaLabel).toBe('View project spotlight');
    expect(spotlight.cadenceLabel).toBe('Monthly feature');

    const pulse = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const leadership = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage);
    expect(pulse.projectMedia).toBeUndefined();
    expect(pulse.ctaLabel).toBeUndefined();
    expect(pulse.cadenceLabel).toBeUndefined();
    expect(leadership.projectMedia).toBeUndefined();
    expect(leadership.ctaLabel).toBeUndefined();
    expect(leadership.cadenceLabel).toBeUndefined();
  });

  it('ready view model derives projectMedia.primaryImageUrl from heroImageUrl when present, falls back to thumbnailUrl when absent', () => {
    const withHero = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight, {
      heroImageUrl: 'https://cdn.example.com/hero.jpg',
      thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
    });
    const vmHero = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution: withHero,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vmHero.projectMedia?.primaryImageUrl).toBe('https://cdn.example.com/hero.jpg');
    expect(vmHero.projectMedia?.thumbnailUrl).toBe('https://cdn.example.com/thumb.jpg');
    expect(vmHero.projectMedia?.hasRecordMedia).toBe(true);
    expect(vmHero.projectMedia?.isPlaceholder).toBe(false);
    expect(vmHero.projectMedia?.accessibleLabel).toContain('A Hosted Edition Title');

    const onlyThumb = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight, {
      heroImageUrl: undefined,
      thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
    });
    const vmThumb = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution: onlyThumb,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vmThumb.projectMedia?.primaryImageUrl).toBe('https://cdn.example.com/thumb.jpg');
    // When thumbnail is the primary, it should not be surfaced separately as a supporting tile.
    expect(vmThumb.projectMedia?.thumbnailUrl).toBeUndefined();
    expect(vmThumb.projectMedia?.hasRecordMedia).toBe(true);
  });

  it('ready view model marks projectMedia.hasRecordMedia false when neither heroImageUrl nor thumbnailUrl is present', () => {
    const noMedia = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight, {
      heroImageUrl: undefined,
      thumbnailUrl: undefined,
    });
    const vm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution: noMedia,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vm.projectMedia?.hasRecordMedia).toBe(false);
    expect(vm.projectMedia?.primaryImageUrl).toBeUndefined();
    expect(vm.projectMedia?.accessibleLabel).toBeUndefined();
  });

  it('cadenceLabel uses record.cadence when present, else "Monthly feature"', () => {
    const withCadence = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight, {
      cadence: 'Monthly',
    });
    const vmWith = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution: withCadence,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vmWith.cadenceLabel).toBe('Monthly');

    const noCadence = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight, {
      cadence: undefined,
    });
    const vmWithout = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution: noCadence,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vmWithout.cadenceLabel).toBe('Monthly feature');
  });

  it('projectLabel surfaces relatedProjectName when distinct from title, else falls back to relatedProjectNumber, else undefined', () => {
    const withName = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight, {
      title: 'The Seaglass Residence',
      relatedProjectName: 'Seaglass Holdings LLC',
    });
    const vmName = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution: withName,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vmName.projectLabel).toBe('Seaglass Holdings LLC');

    const matchingTitle = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight, {
      title: 'The Seaglass Residence',
      relatedProjectName: 'The Seaglass Residence',
    });
    const vmMatch = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution: matchingTitle,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vmMatch.projectLabel).toBeUndefined();

    const onlyNumber = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight, {
      title: 'The Seaglass Residence',
      relatedProjectName: undefined,
      relatedProjectNumber: '24-1107',
    });
    const vmNumber = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution: onlyNumber,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vmNumber.projectLabel).toBe('24-1107');
  });
});

describe('view model — Company Pulse briefing fields', () => {
  it('preview view model populates Pulse fields with labeled placeholders only for the companyPulse lane', () => {
    const pulse = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    expect(pulse.briefingLead?.isPlaceholder).toBe(true);
    expect(pulse.briefingDigest?.length).toBe(4);
    expect(pulse.categoryChips?.map((c) => c.id)).toEqual([
      'news',
      'events',
      'recognition',
      'operations',
    ]);
    expect(pulse.pulseTimeline).toBeDefined();

    const spotlight = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    const leadership = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage);
    expect(spotlight.briefingLead).toBeUndefined();
    expect(spotlight.briefingDigest).toBeUndefined();
    expect(spotlight.categoryChips).toBeUndefined();
    expect(spotlight.pulseTimeline).toBeUndefined();
    expect(leadership.briefingLead).toBeUndefined();
    expect(leadership.briefingDigest).toBeUndefined();
    expect(leadership.categoryChips).toBeUndefined();
    expect(leadership.pulseTimeline).toBeUndefined();
  });

  it('ready view model derives the briefing lead only from FoleonContentRecord and never fabricates digest items', () => {
    const resolution = makeReadyResolution(FOLEON_READER_CONFIGS.companyPulse, {
      contentTypeKey: 'Company Pulse',
      readerKey: 'company-pulse',
      title: 'Companywide April Brief',
      summary: 'Operational, recognition, and event highlights for the week of April 14.',
      lastEditorialUpdate: '2026-04-14T00:00:00.000Z',
    });
    const vm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse, {
      resolution,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });

    expect(vm.briefingLead).toBeDefined();
    expect(vm.briefingLead?.isPlaceholder).toBe(false);
    expect(vm.briefingLead?.title).toBe('Companywide April Brief');
    expect(vm.briefingLead?.body).toBe(
      'Operational, recognition, and event highlights for the week of April 14.',
    );
    expect(vm.briefingLead?.category).toBe('Company Pulse');
    expect(typeof vm.briefingLead?.dateline).toBe('string');

    // Ready-state digest is intentionally empty — no fabricated entries.
    expect(vm.briefingDigest).toEqual([]);
    // Timeline is preview-only.
    expect(vm.pulseTimeline).toBeUndefined();
    // Category chips are static taxonomy.
    expect(vm.categoryChips?.map((c) => c.id)).toEqual([
      'news',
      'events',
      'recognition',
      'operations',
    ]);
  });

  it('ready briefing body uses an honest fallback when the record carries no summary', () => {
    const noSummary = makeReadyResolution(FOLEON_READER_CONFIGS.companyPulse, {
      contentTypeKey: 'Company Pulse',
      readerKey: 'company-pulse',
      summary: undefined,
    });
    const vm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse, {
      resolution: noSummary,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vm.briefingLead?.body).toMatch(/has not been provided/);
  });

  it('Spotlight and Leadership ready view models leave Pulse fields undefined', () => {
    const spotlightRes = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight);
    const leadershipRes = makeReadyResolution(FOLEON_READER_CONFIGS.leadershipMessage, {
      contentTypeKey: 'Leadership',
      readerKey: 'leadership-message',
    });
    const spotlightVm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution: spotlightRes,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    const leadershipVm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage, {
      resolution: leadershipRes,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(spotlightVm.briefingLead).toBeUndefined();
    expect(spotlightVm.briefingDigest).toBeUndefined();
    expect(spotlightVm.categoryChips).toBeUndefined();
    expect(leadershipVm.briefingLead).toBeUndefined();
    expect(leadershipVm.briefingDigest).toBeUndefined();
    expect(leadershipVm.categoryChips).toBeUndefined();
  });
});

describe('view model — Leadership Message executive composition', () => {
  it('preview view model populates leadershipMessage with sample-labeled placeholders only for the leadershipMessage lane', () => {
    const leadership = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage);
    expect(leadership.leadershipMessage).toBeDefined();
    expect(leadership.leadershipMessage?.isPlaceholder).toBe(true);
    expect(leadership.leadershipMessage?.byline).toBe('Sample executive byline');
    expect(leadership.leadershipMessage?.role).toBe('Sample role');
    expect(typeof leadership.leadershipMessage?.pullQuote).toBe('string');
    expect(typeof leadership.leadershipMessage?.messageBody).toBe('string');

    const spotlight = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    const pulse = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    expect(spotlight.leadershipMessage).toBeUndefined();
    expect(pulse.leadershipMessage).toBeUndefined();
  });

  it('ready view model derives leadershipMessage only from FoleonContentRecord — byline/role stay undefined when the schema does not carry them', () => {
    const resolution = makeReadyResolution(FOLEON_READER_CONFIGS.leadershipMessage, {
      contentTypeKey: 'Leadership',
      readerKey: 'leadership-message',
      title: 'A Quarterly Note from Leadership',
      summary: 'A focused message on the year ahead. We are committing to clearer communication and faster decisions.',
      lastEditorialUpdate: '2026-04-10T00:00:00.000Z',
      primaryAudience: 'Companywide',
      archiveGroup: '2026-Q2',
    });
    const vm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage, {
      resolution,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });

    expect(vm.leadershipMessage).toBeDefined();
    expect(vm.leadershipMessage?.isPlaceholder).toBe(false);
    // byline + role are NOT carried by FoleonContentRecord today — adapter
    // never invents executive identity; layout shows honest fallback.
    expect(vm.leadershipMessage?.byline).toBeUndefined();
    expect(vm.leadershipMessage?.role).toBeUndefined();
    // pullQuote derived from the first sentence of record.summary.
    expect(vm.leadershipMessage?.pullQuote).toBe('A focused message on the year ahead.');
    // messageBody derived from full record.summary.
    expect(vm.leadershipMessage?.messageBody).toMatch(/clearer communication/);
    // contextNotes derived from record-backed fields only.
    const noteIds = vm.leadershipMessage?.contextNotes?.map((n) => n.id);
    expect(noteIds).toEqual(['audience', 'archive-group']);
  });

  it('ready view model uses an honest fallback for messageBody when record.summary is missing', () => {
    const noSummary = makeReadyResolution(FOLEON_READER_CONFIGS.leadershipMessage, {
      contentTypeKey: 'Leadership',
      readerKey: 'leadership-message',
      summary: undefined,
    });
    const vm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage, {
      resolution: noSummary,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(vm.leadershipMessage?.messageBody).toMatch(/has not been provided/);
    expect(vm.leadershipMessage?.pullQuote).toBeUndefined();
  });

  it('Spotlight and Pulse ready view models leave leadershipMessage undefined', () => {
    const spotlightRes = makeReadyResolution(FOLEON_READER_CONFIGS.projectSpotlight);
    const pulseRes = makeReadyResolution(FOLEON_READER_CONFIGS.companyPulse, {
      contentTypeKey: 'Company Pulse',
      readerKey: 'company-pulse',
    });
    const spotlightVm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
      resolution: spotlightRes,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    const pulseVm = createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse, {
      resolution: pulseRes,
      shouldMountIframe: true,
      mobileGateActive: false,
      onActivateMobileReader: () => undefined,
      onOpenArchive: () => undefined,
    });
    expect(spotlightVm.leadershipMessage).toBeUndefined();
    expect(pulseVm.leadershipMessage).toBeUndefined();
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
