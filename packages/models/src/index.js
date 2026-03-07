/**
 * @hbc/models — HB Intel Domain Models
 *
 * Canonical TypeScript interfaces, enums, type aliases, and constants for every
 * domain in the HB Intel construction intelligence platform.
 *
 * ## Quick Start
 *
 * ```ts
 * // Import anything from the root barrel:
 * import { ILead, LeadStage, IPagedResult } from '@hbc/models';
 *
 * // Or import from a domain sub-path for tree-shaking:
 * import { ILead } from '@hbc/models/leads';
 * import { SAGA_STEPS } from '@hbc/models/provisioning';
 * ```
 *
 * ## Domains
 *
 * | Domain        | Description                                     |
 * | ------------- | ----------------------------------------------- |
 * | shared        | Pagination, query options, common type aliases   |
 * | leads         | Business development pipeline                   |
 * | estimating    | Bid tracking and kickoff management              |
 * | schedule      | Project activity tracking and metrics            |
 * | buyout        | Procurement and commitment tracking              |
 * | compliance    | Vendor regulatory tracking                       |
 * | contracts     | Contract management and approvals                |
 * | risk          | Risk cost tracking and management                |
 * | scorecard     | Go/No-Go evaluation and version history          |
 * | pmp           | Project Management Plan documents and signatures |
 * | project       | Active project context and portfolio summary     |
 * | auth          | Users, roles, permissions, authentication        |
 * | provisioning  | Site provisioning saga orchestrator               |
 *
 * @see {@link https://github.com/your-org/hb-intel/tree/main/docs/reference/models | Reference Docs}
 * @packageDocumentation
 */
// ─── Shared (pagination, query, utilities) ───────────────────────────────────
export * from './shared/index.js';
// ─── Leads (business development pipeline) ───────────────────────────────────
export * from './leads/index.js';
// ─── Estimating (bid tracking & kickoff) ─────────────────────────────────────
export * from './estimating/index.js';
// ─── Schedule (activity tracking & metrics) ──────────────────────────────────
export * from './schedule/index.js';
// ─── Buyout (procurement & commitments) ──────────────────────────────────────
export * from './buyout/index.js';
// ─── Compliance (vendor regulatory tracking) ─────────────────────────────────
export * from './compliance/index.js';
// ─── Contracts (contract management & approvals) ─────────────────────────────
export * from './contracts/index.js';
// ─── Risk (risk cost tracking & management) ──────────────────────────────────
export * from './risk/index.js';
// ─── Scorecard (Go/No-Go evaluation) ────────────────────────────────────────
export * from './scorecard/index.js';
// ─── PMP (Project Management Plans & signatures) ────────────────────────────
export * from './pmp/index.js';
// ─── Project (active project context & portfolio) ───────────────────────────
export * from './project/index.js';
// ─── Auth (users, roles, permissions) ───────────────────────────────────────
export * from './auth/index.js';
// ─── Provisioning (site provisioning saga) ──────────────────────────────────
export * from './provisioning/index.js';
// ─── UI (shared data-shape interfaces for cross-package use) ─────────────────
export * from './ui/index.js';
//# sourceMappingURL=index.js.map