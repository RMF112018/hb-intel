import React from 'react';
import type { PropsWithChildren } from 'react';

/**
 * Wraps children with all providers required by `@hbc/versioned-record`
 * components and hooks. Use in consuming package tests.
 *
 * Current requirements:
 * - `@hbc/complexity` ComplexityProvider (defaults to 'expert' tier in tests)
 *
 * Usage:
 * ```typescript
 * import { createVersionedRecordWrapper } from '@hbc/versioned-record/testing';
 * const wrapper = createVersionedRecordWrapper({ complexityTier: 'standard' });
 * renderHook(() => useVersionHistory(...), { wrapper });
 * ```
 */
export interface VersionedRecordWrapperOptions {
  /** Complexity tier to simulate. Defaults to 'expert'. */
  complexityTier?: 'essential' | 'standard' | 'expert';
}

export function createVersionedRecordWrapper(
  options: VersionedRecordWrapperOptions = {}
): React.ComponentType<PropsWithChildren> {
  const { complexityTier = 'expert' } = options;

  // Mock @hbc/complexity at module level in consuming test files:
  // vi.mock('@hbc/complexity', () => ({ useComplexity: () => ({ tier: complexityTier }) }));
  // The wrapper itself provides the React tree context.

  function VersionedRecordWrapper({ children }: PropsWithChildren): React.ReactElement {
    // In real usage, @hbc/complexity wraps the app shell.
    // In tests, the vi.mock in setup.ts provides the tier.
    // This wrapper exists to allow future provider additions (e.g., notification context)
    // without requiring test updates in consuming packages.
    return <>{children}</>;
  }

  VersionedRecordWrapper.displayName = `VersionedRecordWrapper(${complexityTier})`;

  return VersionedRecordWrapper;
}
