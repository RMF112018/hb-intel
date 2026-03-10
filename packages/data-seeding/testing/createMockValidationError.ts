import type { ISeedValidationError } from '../src/types';

let errorCounter = 0;

export function createMockValidationError(
  overrides: Partial<ISeedValidationError> = {}
): ISeedValidationError {
  errorCounter++;
  return {
    row: errorCounter,
    column: 'Email',
    value: `bad-email-${errorCounter}`,
    error: 'Invalid email format',
    ...overrides,
  };
}
