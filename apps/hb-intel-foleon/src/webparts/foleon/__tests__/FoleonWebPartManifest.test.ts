import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FOLEON_PACKAGE_VERSION, FOLEON_WEBPART_ID } from '../runtimeContract.js';

interface FoleonManifestEntry {
  readonly title: { readonly default: string };
  readonly description: { readonly default: string };
  readonly hiddenFromToolbox?: boolean;
  readonly properties?: {
    readonly acceptedFoleonOrigins?: string;
    readonly allowPreview?: boolean;
    readonly expectedManifestId?: string;
    readonly expectedPackageVersion?: string;
    readonly foleonRoute?: string;
    readonly contentRegistryListId?: string;
    readonly placementsListId?: string;
    readonly eventsListId?: string;
    readonly syncRunsListId?: string;
  };
}

interface FoleonManifest {
  readonly id: string;
  readonly version: string;
  readonly supportedHosts: ReadonlyArray<string>;
  readonly preconfiguredEntries: ReadonlyArray<FoleonManifestEntry>;
}

function loadManifest(): FoleonManifest {
  const manifestPath = resolve(__dirname, '..', 'FoleonWebPart.manifest.json');
  return JSON.parse(readFileSync(manifestPath, 'utf8')) as FoleonManifest;
}

describe('Foleon web part manifest toolbox entries', () => {
  const manifest = loadManifest();
  const tenantListIdKeys = [
    'contentRegistryListId',
    'placementsListId',
    'eventsListId',
    'syncRunsListId',
  ] as const;

  it('preserves one route-driven component identity and SharePoint web part host', () => {
    expect(manifest.id).toBe(FOLEON_WEBPART_ID);
    expect(manifest.version).toBe(FOLEON_PACKAGE_VERSION);
    expect(manifest.supportedHosts).toEqual(['SharePointWebPart']);
  });

  it('exposes dedicated public reader and Manager toolbox entries', () => {
    expect(manifest.preconfiguredEntries).toHaveLength(4);

    const byTitle = new Map(
      manifest.preconfiguredEntries.map((entry) => [entry.title.default, entry]),
    );
    const highlights = byTitle.get('HB Intel Foleon Highlights');
    const projectSpotlight = byTitle.get('HB Intel Project Spotlight Reader');
    const companyPulse = byTitle.get('HB Intel Company Pulse Reader');
    const manager = byTitle.get('HB Intel Foleon Manager');

    expect(highlights).toBeDefined();
    expect(highlights?.description.default).toBe(
      'Show governed Foleon highlights and route readers into SharePoint-hosted publication experiences.',
    );
    expect(highlights?.hiddenFromToolbox).toBe(false);
    expect(highlights?.properties?.foleonRoute).toBe('highlights');

    expect(projectSpotlight).toBeDefined();
    expect(projectSpotlight?.description.default).toBe(
      'Show the active Project Spotlight Foleon reader for a monthly project profile.',
    );
    expect(projectSpotlight?.hiddenFromToolbox).toBe(false);
    expect(projectSpotlight?.properties?.foleonRoute).toBe('projectSpotlight');

    expect(companyPulse).toBeDefined();
    expect(companyPulse?.description.default).toBe(
      'Show the active Company Pulse Foleon reader for company updates and recognition.',
    );
    expect(companyPulse?.hiddenFromToolbox).toBe(false);
    expect(companyPulse?.properties?.foleonRoute).toBe('companyPulse');

    expect(manager).toBeDefined();
    expect(manager?.description.default).toBe(
      'Manage Foleon content registry, placements, validation, and sync proof.',
    );
    expect(manager?.hiddenFromToolbox).toBe(false);
    expect(manager?.properties?.foleonRoute).toBe('manage');
  });

  it('provides safe governance defaults without tenant-specific list IDs', () => {
    for (const entry of manifest.preconfiguredEntries) {
      expect(entry.properties?.acceptedFoleonOrigins).toBe('https://viewer.us.foleon.com');
      expect(entry.properties?.allowPreview).toBe(false);
      expect(entry.properties?.expectedManifestId).toBe(FOLEON_WEBPART_ID);
      expect(entry.properties?.expectedPackageVersion).toBe(FOLEON_PACKAGE_VERSION);

      for (const key of tenantListIdKeys) {
        expect(entry.properties?.[key]).toBeUndefined();
      }
    }
  });
});
