import { describe, it, expect } from 'vitest';
import {
  storeSiteUrl,
  getSiteUrl,
  storeListHostUrl,
  getListHostUrl,
} from '../hostContext.js';

describe('hostContext', () => {
  it('stores and returns the site URL with trailing slashes trimmed', () => {
    storeSiteUrl('https://example.sharepoint.com/sites/Foo///');
    expect(getSiteUrl()).toBe('https://example.sharepoint.com/sites/Foo');
  });

  it('accepts undefined for site URL', () => {
    storeSiteUrl(undefined);
    expect(getSiteUrl()).toBeUndefined();
  });

  it('stores and returns the list-host override with trailing slashes trimmed', () => {
    storeListHostUrl('https://example.sharepoint.com/sites/Bar/');
    expect(getListHostUrl()).toBe('https://example.sharepoint.com/sites/Bar');
  });

  it('accepts undefined for list-host override', () => {
    storeListHostUrl(undefined);
    expect(getListHostUrl()).toBeUndefined();
  });
});
