/**
 * @hbc/my-work-feed — Registry, Adapter, Runtime, and Operational Contracts
 * SF29-T02
 *
 * @see docs/explanation/feature-decisions/PH7-SF-29-Shared-Feature-My-Work-Feed.md §Interface Contract
 */

import type {
  IMyWorkItem,
  MyWorkSource,
  MyWorkSyncStatus,
  IMyWorkRankingReason,
  IMyWorkLifecyclePreview,
  IMyWorkPermissionState,
  IMyWorkSourceMeta,
  IMyWorkDedupeMetadata,
  IMyWorkSupersessionMetadata,
} from './IMyWorkItem.js';
import type { IMyWorkQuery } from './IMyWorkQuery.js';

// ─── Runtime Context ─────────────────────────────────────────────────────────

export interface IMyWorkRuntimeContext {
  currentUserId: string;
  roleKeys: string[];
  projectIds?: string[];
  isOffline: boolean;
  complexityTier: 'essential' | 'standard' | 'expert';
}

// ─── Registry Entry ──────────────────────────────────────────────────────────

export interface IMyWorkRegistryEntry {
  source: MyWorkSource;
  adapter: IMyWorkSourceAdapter;
  enabledByDefault?: boolean;
  rankingWeight?: number;
}

// ─── Source Adapter ──────────────────────────────────────────────────────────

export interface IMyWorkSourceAdapter {
  source: MyWorkSource;
  isEnabled(context: IMyWorkRuntimeContext): boolean;
  load(query: IMyWorkQuery, context: IMyWorkRuntimeContext): Promise<IMyWorkItem[]>;
}

// ─── Command Result ──────────────────────────────────────────────────────────

export interface IMyWorkCommandResult {
  success: boolean;
  message?: string;
  affectedWorkItemIds?: string[];
}

// ─── Offline State ───────────────────────────────────────────────────────────

export interface IMyWorkOfflineState {
  isOnline: boolean;
  lastSuccessfulSyncIso: string;
  cachedItemCount: number;
  queuedActionCount: number;
  queuedActions: Array<{
    actionKey: string;
    workItemId: string;
    payload: unknown;
    queuedAtIso: string;
  }>;
}

// ─── Queue Health ────────────────────────────────────────────────────────────

export interface IMyWorkQueueHealth {
  freshness: MyWorkSyncStatus;
  lastSyncAtIso: string;
  hiddenSupersededCount: number;
  degradedSourceCount: number;
  /** UIF-011: Source keys that failed to load. Companion to degradedSourceCount. */
  degradedSources?: MyWorkSource[];
  warningMessage?: string;
}

// ─── Reasoning Payload ───────────────────────────────────────────────────────

export interface IMyWorkReasoningPayload {
  workItemId: string;
  canonicalKey: string;
  title: string;
  rankingReason: IMyWorkRankingReason;
  lifecycle: IMyWorkLifecyclePreview;
  permissionState: IMyWorkPermissionState;
  sourceMeta: IMyWorkSourceMeta[];
  dedupeInfo?: IMyWorkDedupeMetadata;
  supersessionInfo?: IMyWorkSupersessionMetadata;
}
