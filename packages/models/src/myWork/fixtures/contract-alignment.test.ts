import { describe, expect, it } from 'vitest';

import {
  ADOBE_SIGN_STATUS_TO_REQUIRED_ACTION,
  MY_PROJECT_LINK_WARNING_CODES,
  MY_WORK_READ_MODEL_MODES,
  MY_WORK_READ_MODEL_SOURCE_STATUSES,
  MY_WORK_READ_MODEL_WARNING_CODES,
} from '../index.js';

import { MY_WORK_FIXTURES } from './index.js';

const ALL_ENVELOPES = [
  ...Object.entries(MY_WORK_FIXTURES.home).map(
    ([key, envelope]) => [`home.${key}`, envelope] as const,
  ),
  ...Object.entries(MY_WORK_FIXTURES['adobe-sign-action-queue']).map(
    ([key, envelope]) => [`adobe-sign-action-queue.${key}`, envelope] as const,
  ),
  ...Object.entries(MY_WORK_FIXTURES['adobe-sign-recent-completions']).map(
    ([key, envelope]) => [`adobe-sign-recent-completions.${key}`, envelope] as const,
  ),
  ...Object.entries(MY_WORK_FIXTURES['project-links']).map(
    ([key, envelope]) => [`project-links.${key}`, envelope] as const,
  ),
];

const DEGRADED_ENVELOPES = ALL_ENVELOPES.filter(
  ([, envelope]) => envelope.sourceStatus !== 'available' && envelope.sourceStatus !== 'partial',
);

describe('My Work fixtures — vocabulary alignment with the contract', () => {
  it.each(ALL_ENVELOPES)(
    '%s envelope mode and sourceStatus belong to the canonical B04 vocabularies',
    (_label, envelope) => {
      expect(MY_WORK_READ_MODEL_MODES).toContain(envelope.mode);
      expect(MY_WORK_READ_MODEL_SOURCE_STATUSES).toContain(envelope.sourceStatus);
    },
  );

  it.each(ALL_ENVELOPES)(
    '%s envelope warning codes belong to the canonical B04 warning vocabulary',
    (_label, envelope) => {
      for (const warning of envelope.warnings) {
        expect(MY_WORK_READ_MODEL_WARNING_CODES).toContain(warning.code);
      }
    },
  );

  it.each(DEGRADED_ENVELOPES)(
    '%s degraded envelope carries exactly one warning whose code equals its sourceStatus',
    (_label, envelope) => {
      expect(envelope.warnings).toHaveLength(1);
      expect(envelope.warnings[0]?.code).toBe(envelope.sourceStatus);
    },
  );
});

describe('My Work fixtures — Adobe queue items honor the canonical status mapping', () => {
  it('every populated queue item maps adobeRecipientStatus to its required action via the canonical table', () => {
    const queueScenarios = Object.values(MY_WORK_FIXTURES['adobe-sign-action-queue']);
    let totalItemsAsserted = 0;
    for (const envelope of queueScenarios) {
      for (const item of envelope.data.items) {
        expect(item.requiredAction).toBe(
          ADOBE_SIGN_STATUS_TO_REQUIRED_ACTION[item.adobeRecipientStatus],
        );
        totalItemsAsserted += 1;
      }
    }
    expect(totalItemsAsserted).toBeGreaterThan(0);
  });

  it('every populated home preview item maps adobeRecipientStatus to its required action via the canonical table', () => {
    const homeScenarios = Object.values(MY_WORK_FIXTURES.home);
    let totalPreviewItemsAsserted = 0;
    for (const envelope of homeScenarios) {
      for (const item of envelope.data.adobeSignActionQueue.previewItems) {
        expect(item.requiredAction).toBe(
          ADOBE_SIGN_STATUS_TO_REQUIRED_ACTION[item.adobeRecipientStatus],
        );
        totalPreviewItemsAsserted += 1;
      }
    }
    expect(totalPreviewItemsAsserted).toBeGreaterThan(0);
  });
});

describe('My Work fixtures — project-links item warnings honor project-links vocabulary', () => {
  it('every project-links item warning is in the canonical project-links warning-code set', () => {
    const allowed = new Set(MY_PROJECT_LINK_WARNING_CODES);
    const projectScenarios = Object.values(MY_WORK_FIXTURES['project-links']);
    for (const envelope of projectScenarios) {
      for (const item of envelope.data.items) {
        for (const warning of item.warnings) {
          expect(allowed.has(warning.code)).toBe(true);
        }
      }
    }
  });
});
