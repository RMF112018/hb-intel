import { createContext } from 'react';
import { DEFAULT_COMPLEXITY_CONTEXT, type IComplexityContext } from '../types/IComplexity';

/**
 * The platform-wide complexity context.
 *
 * Consumed via useComplexity() hook — never import this directly in components.
 * The default value (Standard tier, no coaching, no lock) is used when a
 * component is rendered outside of ComplexityProvider — a dev-mode warning fires.
 */
export const ComplexityContext = createContext<IComplexityContext>(
  DEFAULT_COMPLEXITY_CONTEXT
);

ComplexityContext.displayName = 'ComplexityContext';
