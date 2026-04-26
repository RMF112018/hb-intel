import { describe, expect, it } from 'vitest';
import { plainLanguagePublishDisabledReason } from '../manageDegradedCopy.js';

describe('manageDegradedCopy', () => {
  it('prefers publish validation detail when writes are allowed', () => {
    const reason = plainLanguagePublishDisabledReason(
      true,
      'Write path would block.',
      ['Reader lane assigned: Assign Project Spotlight, Company Pulse, or Leadership Message.'],
    );
    expect(reason).toContain('Assign Project Spotlight');
    expect(reason).not.toContain('Write path');
  });

  it('falls back to write reason when publish checks pass but writes are blocked', () => {
    const reason = plainLanguagePublishDisabledReason(false, 'Saves stay off until API access is approved.', []);
    expect(reason).toContain('API access');
  });
});
