/**
 * P3-E13-T08 Stage 1 Subcontract Execution Readiness Module foundation business rules.
 * Case identity, activation validation, boundary enforcement, SoT authority, module identity guard.
 */

import type {
  AdjacentModuleCode,
  CaseActivationTrigger,
} from './enums.js';
import type {
  ICaseIdentityConstraint,
  IModuleBoundaryDeclaration,
  ISourceOfTruthBoundary,
} from './types.js';
import {
  CASE_ACTIVATION_TRIGGERS,
  MODULE_BOUNDARY_DECLARATIONS,
  MODULE_IDENTITY_EXCLUSIONS,
  SOURCE_OF_TRUTH_BOUNDARIES,
} from './constants.js';

// -- Case Identity Match (T01 §7) --------------------------------------------

/**
 * Returns true if two case identity constraints match, per T01 §7:
 * same project + same subcontractor legal entity + same award/buyout intent.
 * One active case rule: only one active case may exist for the same identity.
 */
export const isActiveCaseIdentityMatch = (
  a: ICaseIdentityConstraint,
  b: ICaseIdentityConstraint,
): boolean =>
  a.projectId === b.projectId &&
  a.subcontractorLegalEntityId === b.subcontractorLegalEntityId &&
  a.awardBuyoutIntent === b.awardBuyoutIntent;

// -- Activation Trigger Validation (T01 §7) -----------------------------------

/**
 * Returns true if the trigger is a valid case activation trigger per T01 §7.
 */
export const isValidActivationTrigger = (
  trigger: CaseActivationTrigger,
): boolean =>
  (CASE_ACTIVATION_TRIGGERS as readonly string[]).includes(trigger);

// -- Module Boundary Lookup (T01 §5) ------------------------------------------

/**
 * Returns the boundary declaration for an adjacent module per T01 §5.
 * Returns undefined if the module is not in the boundary map.
 */
export const getModuleBoundary = (
  adjacentModule: AdjacentModuleCode,
): IModuleBoundaryDeclaration | undefined =>
  MODULE_BOUNDARY_DECLARATIONS.find((b) => b.adjacentModule === adjacentModule);

// -- Financial Boundary Enforcement (T01 §5.1) --------------------------------

/**
 * Returns true if the action respects the Financial boundary per T01 §5.1:
 * Financial reads the gate output. It does not author readiness truth.
 * Any action classified as 'readiness_authoring' from the Financial module
 * is a boundary violation.
 */
export const isFinancialBoundaryRespected = (
  actionClassification: string,
): boolean =>
  actionClassification !== 'readiness_authoring';

// -- Source-of-Truth Authority Lookup (T01 §8) ---------------------------------

/**
 * Returns the source-of-truth boundary row for a given data concern per T01 §8.
 * Returns undefined if the concern is not in the SoT map.
 */
export const getAuthorityForConcern = (
  dataConcern: string,
): ISourceOfTruthBoundary | undefined =>
  SOURCE_OF_TRUTH_BOUNDARIES.find((b) => b.dataConcern === dataConcern);

// -- Module Identity Guard (T01 §2) -------------------------------------------

/**
 * Returns true if the proposed behavior matches one of the 6 "what this module
 * is NOT" exclusions per T01 §2. A true result means the behavior would
 * violate the module's architectural identity.
 */
export const isModuleIdentityViolation = (
  proposedBehavior: string,
): boolean =>
  (MODULE_IDENTITY_EXCLUSIONS as readonly string[]).includes(proposedBehavior);

// -- Cross-Module Immutability -------------------------------------------------

/**
 * The readiness module never mutates adjacent module data. Always returns false.
 * Enforces the boundary rules from T01 §5.
 */
export const canReadinessMutateCrossModuleData = (): false => false;
