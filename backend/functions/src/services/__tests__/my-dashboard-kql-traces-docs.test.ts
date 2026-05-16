import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const REPO_ROOT = resolve(import.meta.dirname, '../../../../../');
const SUPPORTING_KQL_DOC = resolve(
  REPO_ROOT,
  'docs/architecture/plans/MASTER/spfx/my-dashboard/B05.8 - load/supporting/Application_Insights_Validation_Queries.md',
);
const CLOSEOUT_DOC = resolve(
  REPO_ROOT,
  'docs/architecture/plans/MASTER/spfx/my-dashboard/B05.8 - load/Performance_Evidence_Closeout.md',
);

describe('B05.8 KQL guidance', () => {
  it('uses trace-backed JSON telemetry posture in supporting query guidance', () => {
    const source = readFileSync(SUPPORTING_KQL_DOC, 'utf8');
    expect(source).not.toContain('customEvents');
    expect(source).toContain('traces');
    expect(source).toContain('parse_json(message)');
    expect(source).toContain('tostring(payload._telemetryType) == "customEvent"');
  });

  it('uses trace-backed JSON telemetry posture in closeout high-leverage queries', () => {
    const source = readFileSync(CLOSEOUT_DOC, 'utf8');
    expect(source).not.toContain('customEvents');
    expect(source).toContain('traces');
    expect(source).toContain('parse_json(message)');
    expect(source).toContain('tostring(payload._telemetryType) == "customEvent"');
    expect(source).toContain('JSON envelopes in `traces.message`');
  });
});
