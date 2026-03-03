/**
 * @hbc/data-access — Abstract base for all repository adapters.
 *
 * Provides shared error-handling helpers so concrete adapters (mock,
 * SharePoint, proxy, API) stay DRY.
 */

import { NotFoundError, ValidationError, wrapError } from '../errors/index.js';

export abstract class BaseRepository<T> {
  /**
   * Wraps an async operation with consistent error handling.
   * Any non-{@link HbcDataAccessError} thrown inside `fn` is converted
   * via {@link wrapError}.
   */
  protected async wrapAsync<R>(fn: () => Promise<R>, context?: string): Promise<R> {
    try {
      return await fn();
    } catch (err) {
      const wrapped = wrapError(err);
      if (context) {
        wrapped.message = `${context}: ${wrapped.message}`;
      }
      throw wrapped;
    }
  }

  /**
   * Validates that `id` is truthy (and, for numbers, not NaN).
   * Throws {@link ValidationError} when invalid.
   */
  protected validateId(id: string | number, entityName: string): void {
    if (typeof id === 'number' && (isNaN(id) || id <= 0)) {
      throw new ValidationError(`Invalid ${entityName} id: ${id}`, 'id');
    }
    if (!id) {
      throw new ValidationError(`${entityName} id is required`, 'id');
    }
  }

  /**
   * Throws a {@link NotFoundError} for the given entity.
   */
  protected throwNotFound(entityName: string, id: string | number): never {
    throw new NotFoundError(entityName, id);
  }
}
