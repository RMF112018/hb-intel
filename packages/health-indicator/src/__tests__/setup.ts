import { afterEach } from 'vitest';
import { healthIndicatorKpiEmitter } from '../telemetry.js';

afterEach(() => {
  healthIndicatorKpiEmitter.reset();
});
