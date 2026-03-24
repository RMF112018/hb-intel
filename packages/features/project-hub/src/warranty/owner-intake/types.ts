/**
 * P3-E14-T10 Stage 5 Project Warranty Module owner-intake TypeScript contracts.
 * Communication events, prompts, status mapping, cadence advisories, Layer 2 seams.
 */

import type {
  CommunicationCadenceTier,
  CommunicationDirection,
  CommunicationPromptTrigger,
  Layer2SeamContract,
} from './enums.js';
import type { WarrantyCaseStatus, OwnerReportChannel, WarrantyCaseSourceChannel } from '../record-families/enums.js';

// -- IWarrantyCommunicationEvent (T05 §3.1) -----------------------------------
export interface IWarrantyCommunicationEvent {
  readonly communicationEventId: string;
  readonly caseId: string;
  readonly ownerIntakeLogId: string | null;
  readonly direction: CommunicationDirection;
  readonly channel: OwnerReportChannel;
  readonly summary: string;
  readonly communicatedAt: string;
  readonly loggedByUserId: string;
  readonly loggedAt: string;
  readonly sourceChannel: WarrantyCaseSourceChannel;
}

// -- Communication Prompt Definition (T05 §3.2) --------------------------------
export interface ICommunicationPromptDef {
  readonly fromStatus: WarrantyCaseStatus;
  readonly toStatus: WarrantyCaseStatus;
  readonly trigger: CommunicationPromptTrigger;
  readonly promptText: string;
}

// -- Owner Status Mapping (T05 §4.2) ------------------------------------------
export interface IOwnerStatusMapping {
  readonly internalStatus: WarrantyCaseStatus;
  readonly ownerFacingText: string;
}

// -- Communication Cadence Advisory (T05 §4.4) --------------------------------
export interface ICommunicationCadenceAdvisoryDef {
  readonly tier: CommunicationCadenceTier;
  readonly thresholdDays: number;
  readonly advisoryText: string;
}

// -- Layer 2 Seam Contract Definition (T05 §5) --------------------------------
export interface ILayer2SeamContractDef {
  readonly seam: Layer2SeamContract;
  readonly seamField: string;
  readonly phase3Value: string;
  readonly layer2Description: string;
}

// -- Phase 3 Internal Capability (T05 §2.1) -----------------------------------
export interface IPhase3InternalCapabilityDef {
  readonly capability: string;
  readonly phase3Position: string;
}

// -- No-Duplicate SoT Constraint (T05 §6) ------------------------------------
export interface INoSotDuplicateConstraint {
  readonly prohibition: string;
}
