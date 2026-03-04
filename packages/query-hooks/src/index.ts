/**
 * @hbc/query-hooks — TanStack Query hooks + Zustand stores for HB Intel.
 *
 * Comprehensive query/mutation layer covering all 11 domains with
 * optimistic updates, type-safe cache keys, and DI-ready repositories.
 *
 * @example
 * ```ts
 * import {
 *   queryKeys, defaultQueryOptions, useOptimisticMutation,
 *   useRepository,
 *   useLeads, useCreateLead,
 *   useUiStore, useFilterStore,
 * } from '@hbc/query-hooks';
 * ```
 *
 * Reference: Blueprint §1c/§2g/§2e, PH3 §3.1 Option C
 */

// ---------------------------------------------------------------------------
// Query key factory — Blueprint §2g
// ---------------------------------------------------------------------------
export { queryKeys } from './keys.js';

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
export { createQueryKeys } from './utils/index.js';
export type { QueryKeySet } from './utils/index.js';

// ---------------------------------------------------------------------------
// Default options + optimistic mutation helper — Blueprint §1c
// ---------------------------------------------------------------------------
export {
  defaultQueryOptions,
  defaultMutationOptions,
  DEFAULT_STALE_TIME,
  DEFAULT_GC_TIME,
  useOptimisticMutation,
} from './defaults.js';
export type { UseOptimisticMutationOptions } from './defaults.js';

// ---------------------------------------------------------------------------
// Repository resolver + DI — Blueprint §2g
// ---------------------------------------------------------------------------
export { useRepository, setRepositoryOverride, clearRepositoryOverrides } from './useRepository.js';
export type { RepositoryMap, RepositoryKey } from './useRepository.js';

// ---------------------------------------------------------------------------
// Domain hooks — Leads (6)
// ---------------------------------------------------------------------------
export {
  useLeads,
  useLeadById,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useSearchLeads,
} from './leads/index.js';

// ---------------------------------------------------------------------------
// Domain hooks — Schedule (6)
// ---------------------------------------------------------------------------
export {
  useScheduleActivities,
  useScheduleActivityById,
  useCreateScheduleActivity,
  useUpdateScheduleActivity,
  useDeleteScheduleActivity,
  useScheduleMetrics,
} from './schedule/index.js';

// ---------------------------------------------------------------------------
// Domain hooks — Buyout (6)
// ---------------------------------------------------------------------------
export {
  useBuyoutLog,
  useBuyoutEntryById,
  useCreateBuyoutEntry,
  useUpdateBuyoutEntry,
  useDeleteBuyoutEntry,
  useBuyoutSummary,
} from './buyout/index.js';

// ---------------------------------------------------------------------------
// Domain hooks — Scorecard (6)
// ---------------------------------------------------------------------------
export {
  useScorecards,
  useScorecardById,
  useSubmitDecision,
  useUpdateScorecard,
  useDeleteScorecard,
  useScorecardVersions,
} from './scorecard/index.js';

// ---------------------------------------------------------------------------
// Domain hooks — Project (6)
// ---------------------------------------------------------------------------
export {
  useActiveProjects,
  useProjectById,
  useProjectDashboard,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from './project/index.js';

// ---------------------------------------------------------------------------
// Domain hooks — Estimating (7) — NEW
// ---------------------------------------------------------------------------
export {
  useEstimatingTrackers,
  useEstimatingTrackerById,
  useCreateEstimatingTracker,
  useUpdateEstimatingTracker,
  useDeleteEstimatingTracker,
  useEstimatingKickoff,
  useCreateEstimatingKickoff,
} from './estimating/index.js';

// ---------------------------------------------------------------------------
// Domain hooks — Compliance (6) — NEW
// ---------------------------------------------------------------------------
export {
  useComplianceEntries,
  useComplianceEntryById,
  useCreateComplianceEntry,
  useUpdateComplianceEntry,
  useDeleteComplianceEntry,
  useComplianceSummary,
} from './compliance/index.js';

// ---------------------------------------------------------------------------
// Domain hooks — Contracts (7) — NEW
// ---------------------------------------------------------------------------
export {
  useContracts,
  useContractById,
  useCreateContract,
  useUpdateContract,
  useDeleteContract,
  useContractApprovals,
  useCreateContractApproval,
} from './contracts/index.js';

// ---------------------------------------------------------------------------
// Domain hooks — Risk (6) — NEW
// ---------------------------------------------------------------------------
export {
  useRiskItems,
  useRiskItemById,
  useCreateRiskItem,
  useUpdateRiskItem,
  useDeleteRiskItem,
  useRiskManagement,
} from './risk/index.js';

// ---------------------------------------------------------------------------
// Domain hooks — PMP (7) — NEW
// ---------------------------------------------------------------------------
export {
  usePmpPlans,
  usePmpPlanById,
  useCreatePmpPlan,
  useUpdatePmpPlan,
  useDeletePmpPlan,
  usePmpSignatures,
  useCreatePmpSignature,
} from './pmp/index.js';

// ---------------------------------------------------------------------------
// Domain hooks — Auth (6) — NEW
// ---------------------------------------------------------------------------
export {
  useCurrentUser,
  useRoles,
  useRoleById,
  usePermissionTemplates,
  useAssignRole,
  useRemoveRole,
} from './auth/index.js';

// ---------------------------------------------------------------------------
// Zustand stores — Blueprint §2e
// ---------------------------------------------------------------------------
export {
  useUiStore,
  useFilterStore,
  useDomainFilters,
  useFormDraftStore,
} from './stores/index.js';
export type {
  UiState,
  FilterState,
  FilterValue,
  FormDraftState,
} from './stores/index.js';
