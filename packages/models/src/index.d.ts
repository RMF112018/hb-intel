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
export * from './shared/index.js';
export * from './leads/index.js';
export * from './estimating/index.js';
export * from './schedule/index.js';
export * from './buyout/index.js';
export * from './compliance/index.js';
export * from './contracts/index.js';
export * from './risk/index.js';
export * from './scorecard/index.js';
export * from './pmp/index.js';
export * from './project/index.js';
export * from './auth/index.js';
export * from './provisioning/index.js';
export * from './ui/index.js';
//# sourceMappingURL=index.d.ts.map