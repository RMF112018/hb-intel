import { describe, expect, it } from 'vitest';
import { buildAccessDeniedActionModel } from './AccessDenied.js';

describe('buildAccessDeniedActionModel', () => {
  it('hides request-access action when callback is not provided', () => {
    const model = buildAccessDeniedActionModel({
      onGoHome: () => undefined,
      onGoBack: () => undefined,
      onRequestAccess: null,
    });

    expect(model.showGoHome).toBe(true);
    expect(model.showGoBack).toBe(true);
    expect(model.showRequestAccess).toBe(false);
  });

  it('shows request-access action when callback is provided', () => {
    const model = buildAccessDeniedActionModel({
      onGoHome: null,
      onGoBack: null,
      onRequestAccess: () => undefined,
    });

    expect(model.showGoHome).toBe(false);
    expect(model.showGoBack).toBe(false);
    expect(model.showRequestAccess).toBe(true);
  });
});
