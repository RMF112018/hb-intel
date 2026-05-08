import { expect, test } from '@playwright/test';
import {
  isPccLiveUnsafeArtifactPath,
  redactPccLivePhoneNumbers,
  sanitizePccLiveArtifactPath,
  sanitizePccLiveText,
} from './pcc-live.sanitization';

test('sanitizer preserves safe run IDs and evidence paths', () => {
  const safeValues = [
    '20260507-134047',
    'workflow-1778175784527',
    'surface-screenshots-1778175753367',
    'docs/architecture/evidence/pcc-live/20260507-134047/workflow-1778175784527/pcc-live-workflow-evidence.json',
    'docs/architecture/evidence/pcc-live/20260507-134047/surface-screenshots-1778175753367/card-01-1280x720.png',
  ];

  for (const value of safeValues) {
    expect(sanitizePccLiveText(value)).toContain(value);
    expect(sanitizePccLiveArtifactPath(value)).toContain(value);
  }
});

test('phone redaction handles required formats', () => {
  const phones = [
    '+1 (561) 555-1212',
    '561-555-1212',
    '(561) 555-1212',
    '561.555.1212',
    '+15615551212',
    'tel:+15615551212',
    'phone: 561-555-1212',
    'mobile 561 555 1212',
  ];

  for (const value of phones) {
    const redacted = redactPccLivePhoneNumbers(`prefix ${value} suffix`);
    expect(redacted).toContain('[redacted-phone]');
    expect(redacted).not.toContain(value);
  }
});

test('sensitive query params are stripped while base path remains', () => {
  const urls = [
    'https://example.test/path?token=abc123',
    'https://example.test/path?auth=abc123',
    'https://example.test/path?session=abc123',
    'https://example.test/path?secret=abc123',
  ];

  for (const url of urls) {
    const sanitized = sanitizePccLiveText(url);
    expect(sanitized).toContain('https://example.test/path');
    expect(sanitized).not.toContain('?');
    expect(sanitized).not.toContain('token=');
    expect(sanitized).not.toContain('auth=');
    expect(sanitized).not.toContain('session=');
    expect(sanitized).not.toContain('secret=');
  }
});

test('security baseline remains redacted', () => {
  const raw =
    'qa.user@example.com storageState cookies tokens auth session secrets test-results playwright-report trace.zip video.webm network.har .auth ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890TOKENLIKEBLOB <button>failureSummary node.html';
  const sanitized = sanitizePccLiveText(raw, { maxLength: 1000 });

  expect(sanitized).toContain('[redacted-email]');
  expect(sanitized).toContain('[redacted-cred]');
  expect(sanitized).toContain('[redacted-artifact]');
  expect(sanitized).toContain('[redacted-html]');
  expect(sanitized).toContain('[redacted-axe-payload]');
  expect(sanitized).not.toContain('qa.user@example.com');
  expect(sanitized).not.toContain('storageState');
  expect(sanitized).not.toContain('cookie');
  expect(sanitized).not.toContain('token');
  expect(sanitized).not.toContain('session');
  expect(sanitized).not.toContain('test-results');

  const blobSanitized = sanitizePccLiveText('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890TOKENLIKEBLOB');
  expect(blobSanitized).toContain('[redacted-blob]');
});

test('unsafe artifact path detector keeps safe evidence paths', () => {
  expect(isPccLiveUnsafeArtifactPath('test-results/raw-output.json')).toBe(true);
  expect(
    isPccLiveUnsafeArtifactPath('workflow-1778175784527/pcc-live-workflow-evidence.json'),
  ).toBe(false);
  expect(
    sanitizePccLiveArtifactPath(
      'https://example.test/pcc-live/workflow-1778175784527/file.json?token=abc',
    ),
  ).toContain('https://example.test/pcc-live/workflow-1778175784527/file.json');
});
