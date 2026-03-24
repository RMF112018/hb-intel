/**
 * P3-E10-T01 Project Closeout Module foundation business rules.
 * Surface classification, activation model, cross-module immutability.
 */

import type {
  CloseoutConsumptionPoint,
  CloseoutCrossModuleSource,
  CloseoutDerivedIndex,
  CloseoutOperationalSurface,
  CloseoutSurfaceClass,
} from './enums.js';
import {
  CLOSEOUT_OPERATIONAL_SURFACES,
  CLOSEOUT_DERIVED_INDEXES,
  CLOSEOUT_CONSUMPTION_POINTS,
  CLOSEOUT_RECORD_FAMILIES,
} from './constants.js';

// -- Surface Classification (§2.1) ------------------------------------------

/**
 * Returns true if the surface is a Class 1 project-scoped operational surface.
 */
export const isClass1Surface = (surface: CloseoutOperationalSurface): boolean =>
  (CLOSEOUT_OPERATIONAL_SURFACES as readonly string[]).includes(surface);

/**
 * Returns true if the index is a Class 2 org-wide derived read model.
 */
export const isClass2Index = (index: CloseoutDerivedIndex): boolean =>
  (CLOSEOUT_DERIVED_INDEXES as readonly string[]).includes(index);

/**
 * Returns true if the point is a Class 3 Project Hub consumption surface.
 */
export const isClass3ConsumptionPoint = (point: CloseoutConsumptionPoint): boolean =>
  (CLOSEOUT_CONSUMPTION_POINTS as readonly string[]).includes(point);

/**
 * Resolves any surface identifier to its class. Returns undefined if not recognized.
 */
export const getSurfaceClass = (surface: string): CloseoutSurfaceClass | undefined => {
  if ((CLOSEOUT_OPERATIONAL_SURFACES as readonly string[]).includes(surface)) return 'ProjectScoped';
  if ((CLOSEOUT_DERIVED_INDEXES as readonly string[]).includes(surface)) return 'OrgDerived';
  if ((CLOSEOUT_CONSUMPTION_POINTS as readonly string[]).includes(surface)) return 'ProjectHubConsumption';
  return undefined;
};

// -- Record Ownership (§3.1) ------------------------------------------------

/**
 * Returns true if Closeout is the SoT writer for the given record family.
 * All 16 values in CloseoutRecordFamily are Closeout-owned by definition.
 */
export const isCloseoutOwnedRecord = (family: string): boolean =>
  (CLOSEOUT_RECORD_FAMILIES as readonly string[]).includes(family);

// -- Activation Model (§4) --------------------------------------------------

/** Always-on surfaces: accessible from early execution, not gated by closeout phase. */
const ALWAYS_ON_SURFACES: readonly CloseoutOperationalSurface[] = [
  'LessonsLearned',
  'SubcontractorScorecard',
];

/** Phase-gated surfaces: accessible only after closeout phase activation. */
const CLOSEOUT_PHASE_REQUIRED_SURFACES: readonly CloseoutOperationalSurface[] = [
  'CloseoutChecklist',
  'ProjectAutopsy',
];

/**
 * Returns true if the surface is always-on (available from early execution).
 * Per T01 §4: Lessons Learned and Subcontractor Scorecard are accessible
 * from the Project Hub sidebar at any point in the project lifecycle.
 */
export const isAlwaysOnSurface = (surface: CloseoutOperationalSurface): boolean =>
  ALWAYS_ON_SURFACES.includes(surface);

/**
 * Returns true if the surface requires closeout phase activation.
 * Per T01 §4: Checklist and Autopsy are accessible from the Closeout phase
 * activation event forward.
 */
export const isCloseoutPhaseRequired = (surface: CloseoutOperationalSurface): boolean =>
  CLOSEOUT_PHASE_REQUIRED_SURFACES.includes(surface);

// -- Cross-Module Immutability (§3.2) ----------------------------------------

/**
 * Closeout never mutates cross-module data. Always returns false.
 * Enforces the read-only cross-module rule from T01 §3.2.
 */
export const canCloseoutMutate = (_source: CloseoutCrossModuleSource): false => false;

// -- Intelligence Publication (§1, §2.1) -------------------------------------

/**
 * Returns true if the surface is a Function B (intelligence publication) surface.
 * Class 2 derived indexes and Class 3 consumption points are Function B.
 */
export const isIntelligencePublicationSurface = (
  surface: CloseoutDerivedIndex | CloseoutConsumptionPoint,
): boolean =>
  (CLOSEOUT_DERIVED_INDEXES as readonly string[]).includes(surface) ||
  (CLOSEOUT_CONSUMPTION_POINTS as readonly string[]).includes(surface);

/**
 * Class 2 indexes are derived read models populated from PE-approved events.
 * No user session may directly write to them. Always returns false.
 */
export const canClass2IndexBeDirectlyWritten = (): false => false;
