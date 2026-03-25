/**
 * P3-E14-T10 Stage 7 Project Warranty Module ux-surfaces business rules.
 */

import type { WarrantyCaseStatus } from '../record-families/enums.js';
import type { WarrantyComplexityTier } from './enums.js';
import type { INextMoveActionCatalogEntry } from './types.js';
import { COMPLEXITY_ROLE_DEFAULTS, NEXT_MOVE_ACTION_CATALOG } from './constants.js';

/** Returns the Next Move action for a case status per T07 §5.3. */
export const getWarrantyNextMoveForCase = (
  caseStatus: WarrantyCaseStatus,
  acknowledgmentStatus: string | null = null,
): INextMoveActionCatalogEntry | undefined =>
  NEXT_MOVE_ACTION_CATALOG.find(
    (e) => e.caseStatus === caseStatus && (e.acknowledgmentStatus === acknowledgmentStatus || e.acknowledgmentStatus === null),
  );

/** Returns the default complexity tier for a role per T07 §8.4. */
export const getWarrantyDefaultComplexityTier = (
  role: string,
): WarrantyComplexityTier =>
  COMPLEXITY_ROLE_DEFAULTS.find((d) => d.role === role)?.defaultTier ?? 'Standard';

/** System views are immutable per T07 §6.5. Always returns true. */
export const isWarrantySystemViewImmutable = (): true => true;

/** Canvas tile data is from Health spine per T07 §11.3. Always returns true. */
export const isWarrantyCanvasTileDataFromHealthSpine = (): true => true;

/** HBI behaviors are advisory only per T07 §10.3. Always returns true. */
export const isWarrantyHbiBehaviorAdvisoryOnly = (): true => true;
