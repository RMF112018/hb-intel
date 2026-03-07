/**
 * @file shared/index.ts
 * @description Barrel export for shared utility makeStyles hooks.
 *
 * This module provides cross-component utilities that are used by 2+ components
 * and should be maintained in a single location.
 *
 * Convention: Only makeStyles utilities with multiple consumers belong here.
 * Do not use this as a junk drawer for random exports.
 *
 * Traceability:
 * - PH4C.7 §5.C.7
 * - D-PH4C-03
 */

export { useShimmerStyles, type ShimmerStyles } from './shimmer.js';
