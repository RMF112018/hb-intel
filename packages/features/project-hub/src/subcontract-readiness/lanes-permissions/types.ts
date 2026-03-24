/**
 * P3-E13-T08 Stage 6 Subcontract Execution Readiness Module lanes-permissions TypeScript contracts.
 * Role behaviors, action types, annotation targets, lane depth, UX surfaces, visibility.
 */

import type {
  AnnotationTarget,
  DistinctActionType,
  PWADepthCapability,
  ReadinessAuthorityRoleT06,
  SPFxDepthCapability,
  UXSurfaceExpectation,
  VisibilityTier,
} from './enums.js';

/** Role behavior definition per T06 §1.1. */
export interface IRoleBehaviorDef {
  readonly role: ReadinessAuthorityRoleT06;
  readonly primaryBehavior: string;
}

/** Distinct action definition per T06 §2. */
export interface IDistinctActionDef {
  readonly actionType: DistinctActionType;
  readonly description: string;
}

/** Annotation target definition per T06 §3. */
export interface IAnnotationTargetDef {
  readonly target: AnnotationTarget;
  readonly description: string;
}

/** PWA depth capability definition per T06 §4.1. */
export interface IPWADepthCapabilityDef {
  readonly capability: PWADepthCapability;
  readonly description: string;
}

/** SPFx depth capability definition per T06 §4.2. */
export interface ISPFxDepthCapabilityDef {
  readonly capability: SPFxDepthCapability;
  readonly description: string;
}

/** UX surface expectation definition per T06 §5. */
export interface IUXSurfaceExpectationDef {
  readonly expectation: UXSurfaceExpectation;
  readonly description: string;
}

/** Visibility tier definition per T06 §6. */
export interface IVisibilityTierDef {
  readonly tier: VisibilityTier;
  readonly visibleData: readonly string[];
}
