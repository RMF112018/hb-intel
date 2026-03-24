/**
 * P3-E14-T10 Stage 5 Project Warranty Module owner-intake business rules.
 * PM-proxy model, communication prompts, status mapping, cadence, Layer 2 constraints.
 */

import type { WarrantyCaseStatus } from '../record-families/enums.js';
import type { CommunicationCadenceTier } from './enums.js';
import {
  COMMUNICATION_CADENCE_ADVISORIES,
  COMMUNICATION_PROMPT_DEFINITIONS,
  OWNER_STATUS_MAPPINGS,
} from './constants.js';

// -- PM-Proxy Model (T05 §1.1) -----------------------------------------------

/**
 * In Phase 3, all owner intake is PM-entered per T05 §1.1. Always returns true.
 */
export const isOwnerIntakePmProxyOnly = (): true => true;

// -- Owner Status Mapping (T05 §4.2) -----------------------------------------

/**
 * Returns the owner-facing plain-language status text per T05 §4.2.
 * Returns undefined if the status is not mapped.
 */
export const getOwnerFacingStatusText = (
  status: WarrantyCaseStatus,
): string | undefined =>
  OWNER_STATUS_MAPPINGS.find((m) => m.internalStatus === status)?.ownerFacingText;

// -- Communication Prompts (T05 §3.2) ----------------------------------------

/**
 * Returns true if a communication prompt should be triggered for the given transition per T05 §3.2.
 */
export const isCommunicationPromptTriggered = (
  fromStatus: WarrantyCaseStatus,
  toStatus: WarrantyCaseStatus,
): boolean => {
  const prompt = COMMUNICATION_PROMPT_DEFINITIONS.find(
    (p) => p.fromStatus === fromStatus && p.toStatus === toStatus,
  );
  return prompt !== undefined && prompt.trigger !== 'NO_PROMPT';
};

/**
 * Returns the communication prompt text for a transition, or undefined if none.
 */
export const getCommunicationPromptText = (
  fromStatus: WarrantyCaseStatus,
  toStatus: WarrantyCaseStatus,
): string | undefined => {
  const prompt = COMMUNICATION_PROMPT_DEFINITIONS.find(
    (p) => p.fromStatus === fromStatus && p.toStatus === toStatus && p.trigger !== 'NO_PROMPT',
  );
  return prompt?.promptText;
};

// -- Communication Cadence (T05 §4.4) ----------------------------------------

/**
 * Returns true if the communication cadence advisory should fire per T05 §4.4.
 */
export const isCommunicationCadenceOverdue = (
  lastCommunicatedAt: string | null,
  tier: CommunicationCadenceTier,
  now: Date = new Date(),
): boolean => {
  if (!lastCommunicatedAt) return true;
  const advisory = COMMUNICATION_CADENCE_ADVISORIES.find((a) => a.tier === tier);
  if (!advisory) return false;
  const lastComm = new Date(lastCommunicatedAt);
  const diffMs = now.getTime() - lastComm.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= advisory.thresholdDays;
};

// -- Layer 2 Constraints (T05 §6) --------------------------------------------

/**
 * Layer 2 may not create a parallel source of truth per T05 §6. Always returns false.
 */
export const canLayer2CreateParallelStore = (): false => false;
