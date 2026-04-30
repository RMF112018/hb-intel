import { describe, it, expect } from 'vitest';
import { PCC_READ_MODEL_SOURCE_STATUSES } from '@hbc/models/pcc';
import { PCC_PREVIEW_STATES } from '../ui/PccPreviewState.js';
import {
  PCC_SOURCE_STATUS_TO_PREVIEW_STATE,
  mapPccSourceStatusToPreviewState,
} from './pccReadModelStateMapping.js';

describe('mapPccSourceStatusToPreviewState', () => {
  it('covers every PccReadModelSourceStatus value', () => {
    for (const status of PCC_READ_MODEL_SOURCE_STATUSES) {
      expect(PCC_SOURCE_STATUS_TO_PREVIEW_STATE[status]).toBeDefined();
    }
  });

  it('always returns one of the eight known PccPreviewStateKind values', () => {
    for (const status of PCC_READ_MODEL_SOURCE_STATUSES) {
      const mapped = mapPccSourceStatusToPreviewState(status);
      expect(PCC_PREVIEW_STATES).toContain(mapped);
    }
  });

  it('maps backend-unavailable to error', () => {
    expect(mapPccSourceStatusToPreviewState('backend-unavailable')).toBe('error');
  });

  it('maps source-unavailable to unavailable-fixture', () => {
    expect(mapPccSourceStatusToPreviewState('source-unavailable')).toBe(
      'unavailable-fixture',
    );
  });

  it('maps missing-config to missing-config', () => {
    expect(mapPccSourceStatusToPreviewState('missing-config')).toBe('missing-config');
  });

  it('maps unauthorized and forbidden to unauthorized-persona', () => {
    expect(mapPccSourceStatusToPreviewState('unauthorized')).toBe('unauthorized-persona');
    expect(mapPccSourceStatusToPreviewState('forbidden')).toBe('unauthorized-persona');
  });

  it('maps available and stale to preview', () => {
    expect(mapPccSourceStatusToPreviewState('available')).toBe('preview');
    expect(mapPccSourceStatusToPreviewState('stale')).toBe('preview');
  });
});
