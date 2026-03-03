// Query key factory — Blueprint §2g
export { queryKeys } from './keys.js';

// Default options — Blueprint §1c
export { defaultQueryOptions, defaultMutationOptions, DEFAULT_STALE_TIME, DEFAULT_GC_TIME } from './defaults.js';

// Domain hooks
export { useLeads, useLeadById, useCreateLead, useUpdateLead, useDeleteLead, useSearchLeads } from './leads/index.js';
export { useScheduleActivities, useScheduleActivityById, useCreateScheduleActivity, useUpdateScheduleActivity, useDeleteScheduleActivity, useScheduleMetrics } from './schedule/index.js';
export { useBuyoutLog, useBuyoutEntryById, useCreateBuyoutEntry, useUpdateBuyoutEntry, useDeleteBuyoutEntry, useBuyoutSummary } from './buyout/index.js';
export { useScorecards, useScorecardById, useSubmitDecision, useScorecardVersions } from './scorecard/index.js';
export { useActiveProjects, useProjectById, useProjectDashboard, useCreateProject, useUpdateProject } from './project/index.js';
