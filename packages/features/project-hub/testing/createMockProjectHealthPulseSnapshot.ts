import type { ProjectHealthPulseSnapshot } from '../src/health-pulse/types/index.js';

/**
 * Stable SF21 testing fixture surface for T08/T09 integration work.
 */
export const createMockProjectHealthPulseSnapshot = (): ProjectHealthPulseSnapshot => ({
  projectId: 'project-sf21-fixture',
  overallStatus: 'watch',
  overallScore: 72,
  dimensions: [
    { key: 'field', status: 'watch', score: 70, confidence: 'moderate' },
    { key: 'time', status: 'on-track', score: 80, confidence: 'high' },
    { key: 'cost', status: 'watch', score: 68, confidence: 'moderate' },
    { key: 'office', status: 'watch', score: 69, confidence: 'moderate' },
  ],
  reasonCodes: [{ code: 'scaffold-fixture', summary: 'SF21-T01 deterministic placeholder fixture' }],
});
