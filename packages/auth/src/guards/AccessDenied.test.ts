import { describe, expect, it } from 'vitest';
import { buildAccessDeniedActionModel } from './AccessDenied.js';

describe('buildAccessDeniedActionModel', () => {
  it('hides request-access action when callback is not provided', () => {
    const model = buildAccessDeniedActionModel({
      onGoHome: () => undefined,
      onGoBack: () => undefined,
      onRequestAccess: null,
      onSubmitAccessRequest: undefined,
    });

    expect(model.showGoHome).toBe(true);
    expect(model.showGoBack).toBe(true);
    expect(model.showRequestAccess).toBe(false);
    expect(model.showSubmitRequestAccess).toBe(false);
  });

  it('shows request-access action when callback is provided', () => {
    const model = buildAccessDeniedActionModel({
      onGoHome: null,
      onGoBack: null,
      onRequestAccess: () => undefined,
      onSubmitAccessRequest: undefined,
    });

    expect(model.showGoHome).toBe(false);
    expect(model.showGoBack).toBe(false);
    expect(model.showRequestAccess).toBe(true);
    expect(model.showSubmitRequestAccess).toBe(false);
  });

  it('shows submit request access action when queue submitter is provided', () => {
    const model = buildAccessDeniedActionModel({
      onGoHome: null,
      onGoBack: null,
      onRequestAccess: null,
      onSubmitAccessRequest: () => ({ success: true }),
    });

    expect(model.showSubmitRequestAccess).toBe(true);
  });
});
