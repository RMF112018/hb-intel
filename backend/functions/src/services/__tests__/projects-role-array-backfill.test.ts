import { describe, expect, it } from 'vitest';
import {
  buildProjectsRoleArrayPatch,
  migrateProjectsRoleArrays,
  resolveCanonicalRoleArrayWithLegacyFallback,
} from '../projects-role-array-backfill.js';

describe('projects-role-array-backfill', () => {
  it('maps leadEstimatorUpn into leadEstimatorUpns', () => {
    const result = buildProjectsRoleArrayPatch({
      leadEstimatorUpn: 'Lead@HB.com',
      leadEstimatorUpns: '[]',
    });
    expect(result.patch.leadEstimatorUpns).toBe('["lead@hb.com"]');
    expect(result.status).toBe('changed');
  });

  it('maps supportingEstimatorUpns into estimatorUpns with salvage parse', () => {
    const result = buildProjectsRoleArrayPatch({
      supportingEstimatorUpns: "['b@hb.com', 'A@hb.com', invalid]",
      estimatorUpns: '[]',
    });
    expect(result.patch.estimatorUpns).toBe('["a@hb.com","b@hb.com"]');
    expect(result.warnings.some((w) => w.code === 'legacy-parse-salvaged')).toBe(true);
  });

  it('preserves existing canonical values and merges legacy values', () => {
    const result = buildProjectsRoleArrayPatch({
      projectManagerUpn: 'pm2@hb.com',
      projectManagerUpns: '["pm1@hb.com"]',
    });
    expect(result.patch.projectManagerUpns).toBe('["pm1@hb.com","pm2@hb.com"]');
  });

  it('dedupes overlapping duplicates and avoids writes when canonical already matches', () => {
    const result = buildProjectsRoleArrayPatch({
      projectExecutiveUpn: 'exec@hb.com',
      projectExecutiveUpns: '["Exec@hb.com","a@hb.com"]',
    });
    expect(result.patch).toEqual({});
    expect(result.status).toBe('skipped');
  });

  it('returns no patch for already-matched canonical arrays (idempotent rerun)', () => {
    const first = migrateProjectsRoleArrays({
      leadEstimatorUpn: 'lead@hb.com',
      leadEstimatorUpns: '[]',
    });
    const second = migrateProjectsRoleArrays({
      leadEstimatorUpn: 'lead@hb.com',
      leadEstimatorUpns: first.patch.leadEstimatorUpns,
    });

    expect(first.patch.leadEstimatorUpns).toBe('["lead@hb.com"]');
    expect(second.patch).toEqual({});
    expect(second.status).toBe('skipped');
  });

  it('treats legacy Yes/No values as warnings and no writes', () => {
    const result = buildProjectsRoleArrayPatch({
      projectExecutiveUpn: 'Yes',
      projectExecutiveUpns: '[]',
    });
    expect(result.patch).toEqual({});
    expect(result.warnings.some((w) => w.code === 'legacy-invalid-token')).toBe(true);
    expect(result.status).toBe('warning');
  });

  it('empty legacy values keep canonical fields unchanged', () => {
    const result = buildProjectsRoleArrayPatch({
      leadEstimatorUpn: '',
      estimatorUpns: '["a@hb.com"]',
    });
    expect(result.patch).toEqual({});
    expect(result.status).toBe('unchanged');
  });

  it('compat helper prefers canonical and falls back to legacy when canonical is empty', () => {
    expect(
      resolveCanonicalRoleArrayWithLegacyFallback(
        { projectManagerUpns: '["pm1@hb.com"]', projectManagerUpn: 'pm2@hb.com' },
        'projectManagerUpns',
      ),
    ).toEqual(['pm1@hb.com']);

    expect(
      resolveCanonicalRoleArrayWithLegacyFallback(
        { projectManagerUpns: '[]', projectManagerUpn: 'pm2@hb.com' },
        'projectManagerUpns',
      ),
    ).toEqual(['pm2@hb.com']);
  });
});
