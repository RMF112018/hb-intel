import { describe, expect, it } from 'vitest';
import { __testables } from './PublishReadinessDiagnostics.js';

const { describeDecision, describeDrift } = __testables;

function baseOutcome(over: {
  decision?: Record<string, unknown>;
  drift?: Record<string, boolean>;
  composedPage?: Record<string, unknown>;
} = {}): Parameters<typeof describeDecision>[0] {
  return {
    ok: true,
    resolution: {} as never,
    composedPage: {
      identity: {
        templateKey: 'ps-inprogress-monthly-v1',
        shellVersion: '1.0.0',
        templateVersion: '1.0.0',
      },
      ...(over.composedPage ?? {}),
    } as never,
    structuralErrors: [],
    validation: { ok: true, errors: [], warnings: [], summaryByCategory: {} as never },
    decision: {
      action: 'create',
      reason: 'no existing binding',
      regenerationCause: undefined,
      notes: [],
      ...(over.decision ?? {}),
    } as never,
    drift: {
      shellVersionDrift: false,
      templateKeyDrift: false,
      templateVersionDrift: false,
      ...(over.drift ?? {}),
    },
  };
}

describe('describeDecision', () => {
  it('describes create action in plain English', () => {
    const out = describeDecision(baseOutcome(), undefined);
    expect(out.sentence).toMatch(/new destination page will be created/i);
  });

  it('calls out PageId change on regenerate', () => {
    const out = describeDecision(
      baseOutcome({
        decision: {
          action: 'regenerate',
          regenerationCause: 'template key changed',
        },
      }),
      undefined,
    );
    expect(out.sentence).toMatch(/regenerated/i);
    expect(out.sentence).toMatch(/new PageId/i);
    expect(out.detail).toMatch(/template key/i);
  });

  it('preserves PageId on inPlaceUpdate', () => {
    const out = describeDecision(
      baseOutcome({ decision: { action: 'inPlaceUpdate' } }),
      undefined,
    );
    expect(out.sentence).toMatch(/updated in place/i);
    expect(out.sentence).toMatch(/preserved/i);
  });

  it('surfaces shell-version drift as the detail on inPlaceUpdate', () => {
    const out = describeDecision(
      baseOutcome({
        decision: { action: 'inPlaceUpdate' },
        drift: { shellVersionDrift: true },
      }),
      undefined,
    );
    expect(out.detail).toMatch(/shell version drift/i);
  });

  it('describes a noOp action cleanly', () => {
    const out = describeDecision(
      baseOutcome({ decision: { action: 'noOp' } }),
      undefined,
    );
    expect(out.sentence).toMatch(/nothing will change/i);
  });

  it('describes a blocked action', () => {
    const out = describeDecision(
      baseOutcome({ decision: { action: 'blocked' } }),
      undefined,
    );
    expect(out.sentence).toMatch(/blocked/i);
  });
});

describe('describeDrift', () => {
  it('returns an empty list when there is no binding', () => {
    expect(describeDrift(baseOutcome({ drift: { templateKeyDrift: true } }), undefined)).toEqual([]);
  });

  it('emits a line per drift kind when a binding exists', () => {
    const binding = {
      BindingId: 'b-1',
      ArticleId: 'art-1',
      Title: 'x',
      PublishStatus: 'published',
      TargetSiteUrl: 'https://example/sites/x',
      PageName: 'x.aspx',
      PageShellVersion: '0.9.0',
      PageTemplateKey: 'ps-old-v0',
      RenderVersion: '0.9.0',
    } as never;
    const lines = describeDrift(
      baseOutcome({
        drift: {
          shellVersionDrift: true,
          templateKeyDrift: true,
          templateVersionDrift: true,
        },
      }),
      binding,
    );
    expect(lines).toHaveLength(3);
    expect(lines[0]).toMatch(/PageTemplateKey: ps-old-v0 → ps-inprogress-monthly-v1/);
    expect(lines[1]).toMatch(/PageShellVersion: 0\.9\.0 → 1\.0\.0/);
    expect(lines[2]).toMatch(/RenderVersion: 0\.9\.0 → 1\.0\.0/);
  });
});
