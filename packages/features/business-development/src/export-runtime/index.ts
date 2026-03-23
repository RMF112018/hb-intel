/**
 * Business Development export runtime adapter seam.
 * Consumes @hbc/export-runtime public exports only.
 * Module-specific payload composition is adapter-owned.
 *
 * SF24-T07 — reference adapter implementation.
 */

// Adapters — BD-specific export registration and truth provider
export {
  BD_EXPORT_MODULE_KEY,
  bdExportTruthProvider,
  bdExportRegistration,
} from './adapters/index.js';

// Hooks — BD-specific export orchestration (future)
// export * from './hooks/index.js';

// Components — BD-specific export composition shells (future)
// export * from './components/index.js';
