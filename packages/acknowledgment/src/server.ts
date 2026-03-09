/**
 * SF04-T06: React-free barrel for backend/server imports.
 * This entry point exports only types, config, and pure utility functions —
 * no React hooks or components — so Node.js consumers can safely import
 * without a React dependency.
 */
export * from './types/IAcknowledgment.js';
export * from './config/contextTypes.js';
export * from './utils/acknowledgmentLogic.js';
