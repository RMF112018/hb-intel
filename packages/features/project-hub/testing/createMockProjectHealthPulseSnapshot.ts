import type {
  IHealthPulseAdminConfig,
  IProjectHealthPulse,
  IProjectHealthTelemetry,
} from '../src/health-pulse/types/index.js';
import {
  createMockHealthPulseAdminConfig as createMockHealthPulseAdminConfigBase,
  createMockProjectHealthPulse as createMockProjectHealthPulseBase,
  createMockProjectHealthTelemetry as createMockProjectHealthTelemetryBase,
} from './createMockProjectHealthPulse.js';

/**
 * Stable SF21 testing fixture surface for T08/T09 integration work.
 */
export const createMockProjectHealthPulseSnapshot = (): IProjectHealthPulse => ({
  ...createMockProjectHealthPulseBase(),
  projectId: 'project-sf21-fixture',
});

export const createMockHealthPulseAdminConfig = (): IHealthPulseAdminConfig =>
  createMockHealthPulseAdminConfigBase();

export const createMockProjectHealthTelemetry = (): IProjectHealthTelemetry =>
  createMockProjectHealthTelemetryBase();
