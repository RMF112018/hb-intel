import React from 'react';
import { ComplexityTestProvider } from './ComplexityTestProvider';
import type { ComplexityTier } from '../src/types/IComplexity';

/**
 * Creates a Testing Library `wrapper` factory for a given complexity tier (D-10).
 *
 * @example — One-liner test setup
 * render(<MyComponent />, { wrapper: createComplexityWrapper('expert') });
 *
 * @example — With parameterized tests
 * test.each(allTiers)('renders correctly at %s', (tier) => {
 *   render(<MyComponent />, { wrapper: createComplexityWrapper(tier) });
 *   // ...
 * });
 */
export function createComplexityWrapper(tier: ComplexityTier) {
  return function Wrapper({ children }: { children: React.ReactNode }): React.ReactElement {
    return <ComplexityTestProvider tier={tier}>{children}</ComplexityTestProvider>;
  };
}
