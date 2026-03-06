/**
 * HbcFormContext — D-07 centralized form validation context
 * PH4.15 §6 (HF-007) | PH4B-C D-07 | Blueprint §1d
 *
 * D-07 requires all form validation flow to route through HbcForm. This context
 * intentionally exposes the full react-hook-form surface used by all HbcForm
 * primitives (`register`, `handleSubmit`, `formState`, `control`, etc.) while
 * keeping no-op fallbacks for safe rendering outside a provider boundary.
 */
import { createContext, useContext } from 'react';
import type { HbcFormContextValue } from './types.js';

const noop = () => {};
const noopPromise = async () => false;
const noopRegister = (() => ({
  name: '',
  onBlur: noopPromise,
  onChange: noopPromise,
  ref: noop,
})) as unknown as HbcFormContextValue['register'];
const noopHandleSubmit = (() => async () => {}) as unknown as HbcFormContextValue['handleSubmit'];
const noopWatch = (() => ({})) as unknown as HbcFormContextValue['watch'];

const DEFAULT_CONTEXT: HbcFormContextValue = {
  isFormContextActive: false,
  registerField: noop,
  unregisterField: noop,
  setFieldError: noop,
  clearFieldError: noop,
  markDirty: noop,
  register: noopRegister,
  handleSubmit: noopHandleSubmit,
  formState: {
    isDirty: false,
    isLoading: false,
    isSubmitted: false,
    isSubmitSuccessful: false,
    isSubmitting: false,
    isValidating: false,
    isValid: true,
    disabled: false,
    submitCount: 0,
    defaultValues: {},
    dirtyFields: {},
    touchedFields: {},
    validatingFields: {},
    errors: {},
  } as HbcFormContextValue['formState'],
  control: {} as HbcFormContextValue['control'],
  setValue: noop as HbcFormContextValue['setValue'],
  getValues: (() => ({})) as HbcFormContextValue['getValues'],
  watch: noopWatch,
  trigger: noopPromise as HbcFormContextValue['trigger'],
  reset: noop as HbcFormContextValue['reset'],
};

export const HbcFormContext = createContext<HbcFormContextValue>(DEFAULT_CONTEXT);

/** Access HbcForm context — returns noop defaults when used outside an HbcForm */
export function useHbcFormContext(): HbcFormContextValue {
  return useContext(HbcFormContext);
}
