/**
 * Phase 06 Prompt 03 — public PCC analytics foundation API.
 *
 * `pccAnalyticsEcharts` (registration seam) is intentionally not
 * re-exported. Consumers don't need to call `ensurePccAnalyticsRegistered()`
 * directly — `PccEchartsCanvas` calls it on mount.
 */

export * from './PccAnalyticsCard';
export * from './PccEchartsCanvas';
export * from './pccAnalyticsA11y';
export * from './pccAnalyticsFixtures';
export * from './pccAnalyticsOptions';
export * from './pccAnalyticsTheme';
export * from './pccAnalyticsTypes';
export * from './pccAnalyticsViewModels';
