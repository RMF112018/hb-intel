/**
 * Tenant-schema vs. operational-scope pins for destinations.
 *
 * `DESTINATION_VALUES` must stay schema-complete (matches the tenant
 * Choice column); `SUPPORTED_DESTINATIONS` must reflect actual
 * current-sprint publish capability so the authoring UI cannot
 * expose destinations whose pipeline is not wired. Closes P2-3.
 */
import { describe, expect, it } from 'vitest';
import { DESTINATION_VALUES } from './publisherEnums';
import {
  SUPPORTED_DESTINATIONS,
  isDestinationSupported,
  resolveDestinationSiteUrl,
} from './destinationSiteUrls';

describe('SUPPORTED_DESTINATIONS vs. DESTINATION_VALUES', () => {
  it('includes projectSpotlight (wired end to end in the current implementation)', () => {
    expect(SUPPORTED_DESTINATIONS).toContain('projectSpotlight');
    expect(isDestinationSupported('projectSpotlight')).toBe(true);
    expect(resolveDestinationSiteUrl('projectSpotlight')).toBeDefined();
  });

  it('excludes companyPulse (declared future destination, publish pipeline not wired)', () => {
    expect(DESTINATION_VALUES).toContain('companyPulse');
    expect(SUPPORTED_DESTINATIONS).not.toContain('companyPulse');
    expect(isDestinationSupported('companyPulse')).toBe(false);
    expect(resolveDestinationSiteUrl('companyPulse')).toBeUndefined();
  });

  it('is a strict subset of the tenant-schema DESTINATION_VALUES', () => {
    for (const d of SUPPORTED_DESTINATIONS) {
      expect(DESTINATION_VALUES).toContain(d);
    }
  });
});
