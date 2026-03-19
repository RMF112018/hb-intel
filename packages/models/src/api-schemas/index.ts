/**
 * API Contract Schemas — Zod schemas derived from canonical @hbc/models interfaces.
 *
 * These schemas serve as the shared contract validation layer for E1 contract testing.
 * Each schema includes a compile-time bidirectional type conformance check ensuring
 * the Zod schema never drifts from the canonical TypeScript interface.
 *
 * @module api-schemas
 */

// ─── Shared (envelope schemas, pagination) ───────────────────────────────────
export {
  ErrorDetailSchema,
  ErrorEnvelopeSchema,
  PaginationQuerySchema,
  createPagedResponseSchema,
  createItemResponseSchema,
  type ErrorEnvelope,
  type PaginationQuery,
} from './shared.js';

// ─── Lead ────────────────────────────────────────────────────────────────────
export { LeadSchema, LeadFormDataSchema } from './lead.schema.js';

// ─── Project ─────────────────────────────────────────────────────────────────
export { ActiveProjectSchema, PortfolioSummarySchema } from './project.schema.js';

// ─── Estimating ──────────────────────────────────────────────────────────────
export { EstimatingTrackerSchema, EstimatingKickoffSchema } from './estimating.schema.js';

// ─── Schedule ────────────────────────────────────────────────────────────────
export { ScheduleActivitySchema, ScheduleMetricsSchema } from './schedule.schema.js';

// ─── Buyout ──────────────────────────────────────────────────────────────────
export { BuyoutEntrySchema, BuyoutSummarySchema } from './buyout.schema.js';

// ─── Compliance ──────────────────────────────────────────────────────────────
export { ComplianceEntrySchema, ComplianceSummarySchema } from './compliance.schema.js';

// ─── Contract ────────────────────────────────────────────────────────────────
export { ContractInfoSchema, CommitmentApprovalSchema } from './contract.schema.js';

// ─── Risk ────────────────────────────────────────────────────────────────────
export { RiskCostItemSchema, RiskCostManagementSchema } from './risk.schema.js';

// ─── Scorecard ───────────────────────────────────────────────────────────────
export { GoNoGoScorecardSchema, ScorecardVersionSchema } from './scorecard.schema.js';

// ─── PMP ─────────────────────────────────────────────────────────────────────
export { ProjectManagementPlanSchema, PMPSignatureSchema } from './pmp.schema.js';

// ─── Auth ────────────────────────────────────────────────────────────────────
export {
  RoleSchema,
  PermissionTemplateSchema,
  UserRoleSchema,
  JobTitleMappingSchema,
  ExternalProjectAccessSchema,
  InternalUserSchema,
  ExternalUserSchema,
  CurrentUserSchema,
} from './auth.schema.js';
