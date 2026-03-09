import React from 'react';
import { ComplexityContext } from '../src/context/ComplexityContext';
import { mockComplexityContext } from './mockComplexityContext';
import type { ComplexityTier } from '../src/types/IComplexity';
import type { IComplexityContext } from '../src/types/IComplexity';

export interface ComplexityTestProviderProps {
  /** The tier to render at. @default 'standard' */
  tier?: ComplexityTier;
  /** Whether coaching prompts should show. Defaults to true for essential, false otherwise. */
  showCoaching?: boolean;
  /** Whether the tier is locked. */
  isLocked?: boolean;
  lockedBy?: 'admin' | 'onboarding';
  lockedUntil?: string;
  /** Full context override — use when you need spy functions */
  value?: Partial<IComplexityContext>;
  children: React.ReactNode;
}

/**
 * Drop-in replacement for ComplexityProvider in tests and Storybook (D-10).
 * No localStorage, no API calls, no StorageEvent listeners.
 * Renders children at the specified tier immediately with no async gap.
 *
 * @example
 * render(
 *   <ComplexityTestProvider tier="expert">
 *     <MyComplexityAwareComponent />
 *   </ComplexityTestProvider>
 * );
 *
 * @example — With spy functions
 * const ctx = mockComplexityContext({ tier: 'standard' });
 * render(<ComplexityTestProvider value={ctx}><MyComponent /></ComplexityTestProvider>);
 * expect(ctx.setTier).toHaveBeenCalledWith('expert');
 */
export function ComplexityTestProvider({
  tier = 'standard',
  showCoaching,
  isLocked = false,
  lockedBy,
  lockedUntil,
  value,
  children,
}: ComplexityTestProviderProps): React.ReactElement {
  const contextValue = mockComplexityContext({
    tier,
    showCoaching: showCoaching ?? (tier === 'essential'),
    isLocked,
    lockedBy,
    lockedUntil,
    ...value,
  });

  return (
    <ComplexityContext.Provider value={contextValue}>
      {children}
    </ComplexityContext.Provider>
  );
}
