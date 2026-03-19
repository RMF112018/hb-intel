import { setupServer } from 'msw/node';
import { defaultHandlers } from './msw-handlers.js';

/**
 * MSW server for @hbc/data-access contract tests.
 *
 * Usage in test files:
 * ```ts
 * import { server } from '../test-utils/index.js';
 *
 * beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 * ```
 */
export const server = setupServer(...defaultHandlers);
