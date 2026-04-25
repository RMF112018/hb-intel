import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FOLEON_PACKAGE_VERSION, FOLEON_WEBPART_ID } from '../runtimeContract.js';

interface FoleonManifestEntry {
  readonly title: { readonly default: string };
  readonly description: { readonly default: string };
  readonly hiddenFromToolbox?: boolean;
  readonly properties?: {
    readonly foleonRoute?: string;
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

  it('preserves one route-driven component identity and SharePoint web part host', () => {
    expect(manifest.id).toBe(FOLEON_WEBPART_ID);
    expect(manifest.version).toBe(FOLEON_PACKAGE_VERSION);
    expect(manifest.supportedHosts).toEqual(['SharePointWebPart']);
  });

  it('exposes dedicated Highlights and Manager toolbox entries', () => {
    expect(manifest.preconfiguredEntries).toHaveLength(2);

    const byTitle = new Map(
      manifest.preconfiguredEntries.map((entry) => [entry.title.default, entry]),
    );
    const highlights = byTitle.get('HB Intel Foleon Highlights');
    const manager = byTitle.get('HB Intel Foleon Manager');

    expect(highlights).toBeDefined();
    expect(highlights?.description.default).toBe(
      'Show governed Foleon highlights and route readers into SharePoint-hosted publication experiences.',
    );
    expect(highlights?.hiddenFromToolbox).toBe(false);
    expect(highlights?.properties?.foleonRoute).toBe('highlights');

    expect(manager).toBeDefined();
    expect(manager?.description.default).toBe(
      'Manage Foleon content registry, placements, validation, and sync proof.',
    );
    expect(manager?.hiddenFromToolbox).toBe(false);
    expect(manager?.properties?.foleonRoute).toBe('manage');
  });
});
