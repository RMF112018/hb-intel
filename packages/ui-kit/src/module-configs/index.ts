/**
 * Module Configuration Barrel — PH4.13 §13.7
 * Blueprint §1d — All module-specific presets
 */

// Types
export type {
  ModuleTableConfig,
  ModuleLandingConfig,
  ModuleDetailConfig,
} from './types.js';

// Scorecards
export { scorecardsLanding, scorecardsDetail } from './scorecards.config.js';

// RFIs
export { rfisLanding, rfisDetail } from './rfis.config.js';

// Punch List
export { punchListLanding, punchListDetail } from './punch-list.config.js';

// Drawings
export { drawingsLanding, disciplineFilters } from './drawings.config.js';

// Budget
export { budgetLanding } from './budget.config.js';

// Daily Log
export { dailyLogSections, dailyLogVoiceFields } from './daily-log.config.js';

// Turnover
export {
  turnoverLanding,
  turnoverDetail,
  turnoverTearsheetSteps,
} from './turnover.config.js';

// Documents
export { documentsLanding } from './documents.config.js';
