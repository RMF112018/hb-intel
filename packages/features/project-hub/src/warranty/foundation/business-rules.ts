/**
 * P3-E14-T10 Stage 1 Project Warranty Module foundation business rules.
 * SoT ownership, adjacent module boundaries, Layer 2 deferral, out-of-scope guards.
 */

import type {
  WarrantyOutOfScopeItem,
} from './enums.js';
import {
  WARRANTY_OUT_OF_SCOPE_ITEMS,
  WARRANTY_SOT_BOUNDARIES,
} from './constants.js';

// -- SoT Ownership (T01 §5.1) ------------------------------------------------

/**
 * Returns true if Warranty is the SoT owner for the given data concern per T01 §5.1.
 */
export const isWarrantyOwnedConcern = (
  dataConcern: string,
): boolean =>
  WARRANTY_SOT_BOUNDARIES.some(
    (b) => b.dataConcern === dataConcern && b.sotOwner === 'WARRANTY_MODULE',
  );

// -- Adjacent Module Boundaries (T01 §5.2) ------------------------------------

/**
 * Warranty may never write to Closeout records per T01 §5.2. Always returns false.
 */
export const canWarrantyWriteToCloseout = (): false => false;

/**
 * Warranty may never write to Startup records per T01 §5.2. Always returns false.
 */
export const canWarrantyWriteToStartup = (): false => false;

/**
 * Warranty may never write Financial records per T01 §5.2. Always returns false.
 */
export const canWarrantyWriteToFinancial = (): false => false;

/**
 * Warranty may never create a Financial commitment record per T01 §5.2. Always returns false.
 */
export const canWarrantyCreateFinancialCommitment = (): false => false;

// -- Out-of-Scope Guards (T01 §6) --------------------------------------------

/**
 * Returns true if the item is explicitly out of scope for Phase 3 per T01 §6.
 */
export const isOutOfScopeForPhase3 = (
  item: WarrantyOutOfScopeItem,
): boolean =>
  (WARRANTY_OUT_OF_SCOPE_ITEMS as readonly string[]).includes(item);

// -- Layer 2 Deferral (T01 §4) ------------------------------------------------

/**
 * Layer 2 is deferred per T01 §4. Always returns true.
 */
export const isLayer2Deferred = (): true => true;

/**
 * Layer 2 seam fields are optional discriminators per T01 §4.3. Always returns true.
 */
export const isLayer2SeamFieldOptional = (): true => true;

/**
 * Layer 2 must write to Phase 3 record model per T01 §4.2. Always returns true.
 */
export const mustLayer2UsePhase3RecordModel = (): true => true;
