/**
 * P3-E4-T01 integration boundary surface.
 * Actual adapter functions arrive with T02+ when data model and integrations are implemented.
 */

export { FINANCIAL_INTEGRATION_BOUNDARIES } from '../constants/index.js';
export type {
  FinancialIntegrationDirection,
  IFinancialIntegrationBoundary,
} from '../types/index.js';

export const FINANCIAL_INTEGRATIONS_SCOPE = 'financial/integrations';
