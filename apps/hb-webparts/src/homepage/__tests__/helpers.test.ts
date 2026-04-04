import { describe, expect, it } from 'vitest';
import { normalizeHomepageConfig } from '../helpers/config.js';
import { resolveGreetingForHour } from '../helpers/greeting.js';
import { resolveFirstName } from '../helpers/identity.js';

describe('homepage helper seams', () => {
  it('resolves first-name using preferred name before other fields', () => {
    expect(
      resolveFirstName({
        preferredName: 'Morgan Blake',
        displayName: 'Display Name',
        email: 'user@example.com',
      }),
    ).toBe('Morgan');
  });

  it('resolves greeting deterministically from hour buckets', () => {
    expect(resolveGreetingForHour(7)).toBe('Good morning');
    expect(resolveGreetingForHour(13)).toBe('Good afternoon');
    expect(resolveGreetingForHour(21)).toBe('Good evening');
  });

  it('normalizes config with guarded defaults', () => {
    expect(normalizeHomepageConfig({ maxItems: 0, showSectionHeaders: false })).toEqual({
      maxItems: 5,
      showSectionHeaders: false,
      enableAudienceFilter: true,
    });
  });
});
