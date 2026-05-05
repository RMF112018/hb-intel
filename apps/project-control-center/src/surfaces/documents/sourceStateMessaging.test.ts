import { describe, expect, it } from 'vitest';
import {
  resolveDisabledMessage,
  resolveEntryHealthMessage,
  resolveLaneEnvelopeMessage,
} from './sourceStateMessaging';

describe('sourceStateMessaging — product-grade copy', () => {
  describe('throttled health copy contains no preview-mode disclosure', () => {
    it('uses product-grade retry guidance for project-record', () => {
      const msg = resolveEntryHealthMessage('project-record', 'throttled');
      expect(msg.message).toBe('Microsoft 365 limited the request. Try again in a minute.');
    });
    it('uses product-grade retry guidance for my-project-files', () => {
      const msg = resolveEntryHealthMessage('my-project-files', 'throttled');
      expect(msg.message).toBe('Microsoft 365 limited the request. Try again in a minute.');
    });
    it('uses product-grade retry guidance for external-systems', () => {
      const msg = resolveEntryHealthMessage('external-systems', 'throttled');
      expect(msg.message).toBe('This system limited the request. Try again in a minute.');
    });
  });

  describe('backend-unavailable envelope copy avoids developer artifacts', () => {
    const expected = 'Document control is temporarily unavailable. Try again later.';
    it('renders product-grade copy for project-record', () => {
      const msg = resolveLaneEnvelopeMessage('project-record', 'backend-unavailable');
      expect(msg?.message).toBe(expected);
      expect(msg?.label).toBe('Temporarily unavailable');
    });
    it('renders product-grade copy for my-project-files', () => {
      const msg = resolveLaneEnvelopeMessage('my-project-files', 'backend-unavailable');
      expect(msg?.message).toBe(expected);
    });
    it('renders product-grade copy for external-systems', () => {
      const msg = resolveLaneEnvelopeMessage('external-systems', 'backend-unavailable');
      expect(msg?.message).toBe(expected);
    });
  });

  describe('available envelope status returns undefined (no envelope message)', () => {
    it('skips message rendering when source is available', () => {
      expect(resolveLaneEnvelopeMessage('project-record', 'available')).toBeUndefined();
    });
  });

  describe('disabled lane copy is concise and product-safe', () => {
    it('returns the project-record disabled label', () => {
      const msg = resolveDisabledMessage('project-record');
      expect(msg.label).toBe('Disabled');
      expect(msg.message).toBe('Intentionally disabled for this project.');
    });
  });
});
