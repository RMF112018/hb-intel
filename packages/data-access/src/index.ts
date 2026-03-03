// Ports (type-only re-exports)
export type { ILeadRepository } from './ports/ILeadRepository.js';
export type { IEstimatingRepository } from './ports/IEstimatingRepository.js';
export type { IScheduleRepository } from './ports/IScheduleRepository.js';
export type { IBuyoutRepository } from './ports/IBuyoutRepository.js';
export type { IComplianceRepository } from './ports/IComplianceRepository.js';
export type { IContractRepository } from './ports/IContractRepository.js';
export type { IRiskRepository } from './ports/IRiskRepository.js';
export type { IScorecardRepository } from './ports/IScorecardRepository.js';
export type { IPmpRepository } from './ports/IPmpRepository.js';
export type { IProjectRepository } from './ports/IProjectRepository.js';
export type { IAuthRepository } from './ports/IAuthRepository.js';

// Mock adapters (concrete implementations for dev/test)
export { MockLeadRepository, MockScheduleRepository, MockBuyoutRepository } from './adapters/mock/index.js';

// Factory
export { createLeadRepository, createScheduleRepository, createBuyoutRepository } from './factory.js';
export type { AdapterMode } from './factory.js';
export { resolveAdapterMode } from './factory.js';
