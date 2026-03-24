/**
 * P3-E13-T08 Stage 7 Subcontract Execution Readiness Module cross-module-contracts TypeScript contracts.
 * Financial gate projection, module boundaries, related items, activity events, future inputs.
 */

import type {
  CrossModuleActivityEvent,
  DownstreamConsumer,
  ExternalDisplacementProhibition,
  FinancialProhibition,
  FutureExternalInputType,
  ReadinessRelatedItemPair,
  StartupAllowedConsumption,
  StartupProhibitedConsumption,
} from './enums.js';

/** Financial gate projection per T07 §1.2. */
export interface IReadinessGateProjection {
  readonly linkedBuyoutLineId: string;
  readonly readinessCaseId: string;
  readonly executionReadinessOutcome: string;
  readonly decisionIssuedAt: string;
  readonly decisionVersion: number;
  readonly blockingReasonCode: string | null;
  readonly supersededByCaseId: string | null;
}

/** Financial prohibition definition per T07 §1.3. */
export interface IFinancialProhibitionDef {
  readonly prohibition: FinancialProhibition;
  readonly description: string;
}

/** Startup boundary definition per T07 §2. */
export interface IStartupBoundaryAllowedDef {
  readonly consumption: StartupAllowedConsumption;
  readonly description: string;
}

/** Startup prohibited consumption per T07 §2. */
export interface IStartupBoundaryProhibitedDef {
  readonly consumption: StartupProhibitedConsumption;
  readonly description: string;
}

/** Downstream consumer definition per T07 §3. */
export interface IDownstreamConsumerDef {
  readonly consumer: DownstreamConsumer;
  readonly consumptionDescription: string;
}

/** Related item pair definition per T07 §4.1. */
export interface IRelatedItemPairDef {
  readonly pair: ReadinessRelatedItemPair;
  readonly description: string;
}

/** Cross-module activity event definition per T07 §4.2. */
export interface ICrossModuleActivityEventDef {
  readonly event: CrossModuleActivityEvent;
  readonly description: string;
}

/** Future external input definition per T07 §5. */
export interface IFutureExternalInputDef {
  readonly inputType: FutureExternalInputType;
  readonly description: string;
}

/** External displacement prohibition per T07 §5. */
export interface IExternalDisplacementProhibitionDef {
  readonly prohibition: ExternalDisplacementProhibition;
  readonly description: string;
}
