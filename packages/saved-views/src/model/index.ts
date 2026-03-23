/**
 * SF26-T03 — View lifecycle model.
 *
 * Governing: SF26-T03
 */

export { createSavedView, VIEW_LIFECYCLE_STATES } from './lifecycle.js';
export type { ViewLifecycleState, ICreateSavedViewInput } from './lifecycle.js';
export { reconcile } from './compatibility.js';
