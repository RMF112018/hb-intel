/**
 * W0-G5-T08: MSW server for PWA integration tests.
 */
import { setupServer } from 'msw/node';
import { handlers } from './handlers.js';

export const server = setupServer(...handlers);
