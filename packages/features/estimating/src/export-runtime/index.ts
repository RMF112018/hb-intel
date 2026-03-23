/**
 * Estimating export runtime adapter seam.
 * Consumes @hbc/export-runtime public exports only.
 * Module-specific payload composition is adapter-owned.
 *
 * SF24-T07 — reference adapter implementation.
 */

// Adapters — Estimating-specific export registration and truth provider
export {
  ESTIMATING_EXPORT_MODULE_KEY,
  estimatingExportTruthProvider,
  estimatingExportRegistration,
} from './adapters/index.js';

// Hooks — Estimating-specific export orchestration (future)
// export * from './hooks/index.js';

// Components — Estimating-specific export composition shells (future)
// export * from './components/index.js';
