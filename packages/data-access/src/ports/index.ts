/**
 * @hbc/data-access — Port interfaces barrel.
 *
 * All 11 domain-scoped repository interfaces are re-exported here
 * as type-only imports. These define the contracts that adapters must implement.
 *
 * @example
 * ```ts
 * import type { ILeadRepository, IProjectRepository } from '@hbc/data-access/ports';
 * ```
 */
export type { ILeadRepository } from './ILeadRepository.js';
export type { IEstimatingRepository } from './IEstimatingRepository.js';
export type { IScheduleRepository } from './IScheduleRepository.js';
export type { IBuyoutRepository } from './IBuyoutRepository.js';
export type { IComplianceRepository } from './IComplianceRepository.js';
export type { IContractRepository } from './IContractRepository.js';
export type { IRiskRepository } from './IRiskRepository.js';
export type { IScorecardRepository } from './IScorecardRepository.js';
export type { IPmpRepository } from './IPmpRepository.js';
export type { IProjectRepository } from './IProjectRepository.js';
export type { IAuthRepository } from './IAuthRepository.js';
