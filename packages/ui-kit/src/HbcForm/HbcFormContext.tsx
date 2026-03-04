/**
 * HbcFormContext — Form-level validation state, dirty tracking, error summary
 * PH4.11 §Step 1 | Blueprint §1d
 *
 * Fields outside an HbcForm use the noop default context — they render and
 * function normally but don't participate in error summary or dirty tracking.
 */
import { createContext, useContext } from 'react';
import type { HbcFormContextValue } from './types.js';

const noop = () => {};

const DEFAULT_CONTEXT: HbcFormContextValue = {
  registerField: noop,
  unregisterField: noop,
  setFieldError: noop,
  clearFieldError: noop,
  markDirty: noop,
};

export const HbcFormContext = createContext<HbcFormContextValue>(DEFAULT_CONTEXT);

/** Access HbcForm context — returns noop defaults when used outside an HbcForm */
export function useHbcFormContext(): HbcFormContextValue {
  return useContext(HbcFormContext);
}
