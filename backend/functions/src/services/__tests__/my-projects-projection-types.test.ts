import { describe, expect, it } from 'vitest';
import {
  PROJECTION_MESSAGE_ID_PREFIX,
  PROJECTION_MESSAGE_SCHEMA_VERSION,
  PROJECTION_MESSAGE_TYPE,
  PROJECTION_READ_MODES,
  PROJECTION_RUN_STATUSES,
  PROJECTION_RUN_TYPES,
  PROJECTION_VERSION,
  SOURCE_LIST_KINDS,
  isProjectionReadMode,
  isProjectionRunStatus,
  isProjectionRunType,
  isSourceListKind,
} from '../my-projects-projection/projection-types.js';

describe('my-projects-projection types', () => {
  it('exposes the locked SourceListKind tuple', () => {
    expect([...SOURCE_LIST_KINDS]).toEqual(['Projects', 'LegacyRegistry']);
  });

  it('isSourceListKind accepts wire spellings', () => {
    expect(isSourceListKind('Projects')).toBe(true);
    expect(isSourceListKind('LegacyRegistry')).toBe(true);
  });

  it.each(['legacy-registry', 'projects', 'Legacy Registry', '', null, undefined, 42, {}])(
    'isSourceListKind rejects %p',
    (value) => {
      expect(isSourceListKind(value)).toBe(false);
    },
  );

  it('exposes the locked ProjectionRunType tuple', () => {
    expect([...PROJECTION_RUN_TYPES]).toEqual([
      'seed',
      'incremental',
      'subscription-renewal',
      'drift-audit',
      'drift-repair',
      'purge',
      'manual-rebuild',
    ]);
  });

  it.each(PROJECTION_RUN_TYPES.map((type) => [type] as const))(
    'isProjectionRunType accepts %s',
    (type) => {
      expect(isProjectionRunType(type)).toBe(true);
    },
  );

  it('isProjectionRunType rejects unknown values', () => {
    expect(isProjectionRunType('rebuild')).toBe(false);
    expect(isProjectionRunType('Seed')).toBe(false);
    expect(isProjectionRunType(0)).toBe(false);
  });

  it('exposes the locked ProjectionRunStatus tuple', () => {
    expect([...PROJECTION_RUN_STATUSES]).toEqual([
      'running',
      'succeeded',
      'failed',
      'partial',
      'skipped',
    ]);
  });

  it.each(PROJECTION_RUN_STATUSES.map((status) => [status] as const))(
    'isProjectionRunStatus accepts %s',
    (status) => {
      expect(isProjectionRunStatus(status)).toBe(true);
    },
  );

  it('isProjectionRunStatus rejects unknown values', () => {
    expect(isProjectionRunStatus('done')).toBe(false);
    expect(isProjectionRunStatus('SUCCEEDED')).toBe(false);
  });

  it('exposes only legacy and projection read modes', () => {
    expect([...PROJECTION_READ_MODES]).toEqual(['legacy', 'projection']);
    expect(isProjectionReadMode('legacy')).toBe(true);
    expect(isProjectionReadMode('projection')).toBe(true);
    expect(isProjectionReadMode('mixed')).toBe(false);
    expect(isProjectionReadMode('LEGACY')).toBe(false);
  });

  it('locks projection version and message identity constants', () => {
    expect(PROJECTION_VERSION).toBe('v1');
    expect(PROJECTION_MESSAGE_TYPE).toBe('my-projects-projection-sync');
    expect(PROJECTION_MESSAGE_SCHEMA_VERSION).toBe('v1');
    expect(PROJECTION_MESSAGE_ID_PREFIX).toBe('my-projects-projection');
  });
});
