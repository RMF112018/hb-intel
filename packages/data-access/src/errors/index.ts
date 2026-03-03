/**
 * @hbc/data-access — Typed error hierarchy.
 *
 * All data-access errors extend {@link HbcDataAccessError} so consumers can
 * catch a single base type while still discriminating via `code`.
 */

// ---------------------------------------------------------------------------
// Base error
// ---------------------------------------------------------------------------

export class HbcDataAccessError extends Error {
  readonly code: string;
  readonly cause?: unknown;

  constructor(message: string, code: string, cause?: unknown) {
    super(message);
    this.name = 'HbcDataAccessError';
    this.code = code;
    this.cause = cause;
  }
}

// ---------------------------------------------------------------------------
// Concrete errors
// ---------------------------------------------------------------------------

export class NotFoundError extends HbcDataAccessError {
  constructor(entityType: string, id: string | number) {
    super(`${entityType} with id "${id}" not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends HbcDataAccessError {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class AdapterNotImplementedError extends HbcDataAccessError {
  constructor(adapterMode: string, domain: string) {
    super(
      `${domain} adapter for mode "${adapterMode}" is not yet implemented`,
      'ADAPTER_NOT_IMPLEMENTED',
    );
    this.name = 'AdapterNotImplementedError';
  }
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Wraps an unknown thrown value into a {@link HbcDataAccessError}.
 * If the value is already an `HbcDataAccessError` it is returned as-is.
 */
export function wrapError(err: unknown): HbcDataAccessError {
  if (err instanceof HbcDataAccessError) return err;
  const message = err instanceof Error ? err.message : String(err);
  return new HbcDataAccessError(message, 'UNKNOWN', err);
}
