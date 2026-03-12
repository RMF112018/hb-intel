/**
 * SF21 components boundary.
 * Presentation surfaces are implemented in SF21-T05/T06.
 */

export const HEALTH_PULSE_COMPONENTS_SCOPE = 'health-pulse/components';

export { ProjectHealthPulseCard, type ProjectHealthPulseCardProps } from './ProjectHealthPulseCard.js';
export { ProjectHealthPulseDetail, type ProjectHealthPulseDetailProps } from './ProjectHealthPulseDetail.js';
export { ExplainabilityDrawer, type ExplainabilityDrawerProps } from './ExplainabilityDrawer.js';
export {
  HealthDimensionTab,
  type HealthDimensionTabProps,
} from './HealthDimensionTab.js';
export {
  HealthMetricInlineEdit,
  type HealthMetricInlineEditProps,
  type IHealthMetricInlineEditSavePayload,
} from './HealthMetricInlineEdit.js';
export {
  PortfolioHealthTable,
  type PortfolioHealthTableProps,
} from './PortfolioHealthTable.js';
export {
  HealthPulseAdminPanel,
  type HealthPulseAdminPanelProps,
} from './HealthPulseAdminPanel.js';
