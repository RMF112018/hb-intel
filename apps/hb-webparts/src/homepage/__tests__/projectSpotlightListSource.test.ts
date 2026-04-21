import { describe, expect, it } from 'vitest';
import {
  mapListItemToSpotlight,
  type RawSpotlightListItem,
} from '../data/projectSpotlightListSource.js';

/**
 * Project Spotlight list read-seam — image-truth contract.
 *
 * Pins every supported PrimaryImage input shape so the hosted
 * runtime cannot silently regress to a missing-image hero state.
 * Covers:
 *   - SharePoint Hyperlink column (odata=nometadata → { Url, Description })
 *   - plain URL string
 *   - legacy Image column JSON-encoded string
 *   - legacy Image column pre-parsed object
 *   - authoring gaps (undefined, empty string, empty Url)
 */

const SITE_URL = 'https://tenant.sharepoint.com/sites/hb-central';

function baseItem(): RawSpotlightListItem {
  return {
    Title: 'Palm Beach Medical Campus',
    ProjectId: 'pbc-med',
    Summary: 'Structural turnover in progress.',
  };
}

describe('mapListItemToSpotlight — PrimaryImage extraction', () => {
  it('maps a SharePoint Hyperlink object { Url, Description }', () => {
    const mapped = mapListItemToSpotlight(
      {
        ...baseItem(),
        PrimaryImage: {
          Url: 'https://cdn.example.invalid/projects/palm-beach.jpg',
          Description: 'Palm Beach aerial',
        },
        PrimaryImageAltText: 'Palm Beach aerial',
      },
      SITE_URL,
    );
    expect(mapped.image).toEqual({
      src: 'https://cdn.example.invalid/projects/palm-beach.jpg',
      alt: 'Palm Beach aerial',
      aspectRatio: '16:9',
    });
  });

  it('maps a plain URL string (Hyperlink serialized as scalar)', () => {
    const mapped = mapListItemToSpotlight(
      {
        ...baseItem(),
        PrimaryImage: '/sites/hb-central/SiteAssets/projects/boca.jpg',
        PrimaryImageAltText: 'Boca campus',
      },
      SITE_URL,
    );
    expect(mapped.image?.src).toBe(
      '/sites/hb-central/SiteAssets/projects/boca.jpg',
    );
    expect(mapped.image?.alt).toBe('Boca campus');
  });

  it('maps a legacy Image-column JSON-encoded string', () => {
    const encoded = JSON.stringify({
      fileName: 'ftl.jpg',
      serverUrl: 'https://tenant.sharepoint.com',
      serverRelativeUrl: '/sites/hb-central/SiteAssets/projects/ftl.jpg',
      type: 'Image',
    });
    const mapped = mapListItemToSpotlight(
      { ...baseItem(), PrimaryImage: encoded },
      SITE_URL,
    );
    expect(mapped.image?.src).toBe(
      'https://tenant.sharepoint.com/sites/hb-central/SiteAssets/projects/ftl.jpg',
    );
  });

  it('maps a legacy Image-column pre-parsed object', () => {
    const mapped = mapListItemToSpotlight(
      {
        ...baseItem(),
        PrimaryImage: {
          serverUrl: 'https://tenant.sharepoint.com',
          serverRelativeUrl: '/sites/hb-central/SiteAssets/projects/jupiter.jpg',
        },
      },
      SITE_URL,
    );
    expect(mapped.image?.src).toBe(
      'https://tenant.sharepoint.com/sites/hb-central/SiteAssets/projects/jupiter.jpg',
    );
  });

  it('falls back to siteUrl when a legacy Image object omits serverUrl', () => {
    const mapped = mapListItemToSpotlight(
      {
        ...baseItem(),
        PrimaryImage: {
          serverRelativeUrl: '/sites/hb-central/SiteAssets/projects/relative.jpg',
        },
      },
      SITE_URL,
    );
    expect(mapped.image?.src).toBe(
      `${SITE_URL}/sites/hb-central/SiteAssets/projects/relative.jpg`,
    );
  });

  it('returns no image when the field is absent', () => {
    const mapped = mapListItemToSpotlight(baseItem(), SITE_URL);
    expect(mapped.image).toBeUndefined();
  });

  it('returns no image when the field is an empty string', () => {
    const mapped = mapListItemToSpotlight(
      { ...baseItem(), PrimaryImage: '' },
      SITE_URL,
    );
    expect(mapped.image).toBeUndefined();
  });

  it('returns no image when a Hyperlink object has an empty Url', () => {
    const mapped = mapListItemToSpotlight(
      {
        ...baseItem(),
        PrimaryImage: { Url: '', Description: '' },
      },
      SITE_URL,
    );
    expect(mapped.image).toBeUndefined();
  });
});
