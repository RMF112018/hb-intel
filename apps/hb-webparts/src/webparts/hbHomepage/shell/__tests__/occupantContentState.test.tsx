/**
 * @vitest-environment jsdom
 */
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { act, render } from '@testing-library/react';
import {
  OccupantContentStateProvider,
  toOccupantContentStateDataAttributes,
  useOccupantContentStateReport,
  useOccupantContentStateReports,
  useReportOccupantContentState,
  type OccupantContentStateReport,
} from '../occupantContentState.js';

function Reporter({ report }: { report: OccupantContentStateReport | undefined }): null {
  useReportOccupantContentState(report);
  return null;
}

function Inspector({
  onRead,
}: {
  onRead: (map: ReadonlyMap<string, OccupantContentStateReport>) => void;
}): null {
  const reports = useOccupantContentStateReports();
  React.useEffect(() => {
    onRead(reports as ReadonlyMap<string, OccupantContentStateReport>);
  }, [reports, onRead]);
  return null;
}

function SingleReader({
  occupantId,
  onRead,
}: {
  occupantId: 'leadership-message' | 'company-pulse';
  onRead: (report: OccupantContentStateReport | undefined) => void;
}): null {
  const report = useOccupantContentStateReport(occupantId);
  React.useEffect(() => {
    onRead(report);
  }, [report, onRead]);
  return null;
}

describe('occupantContentState', () => {
  it('round-trips reports from a reporter through the provider to a reader', () => {
    let latest: OccupantContentStateReport | undefined;
    const report: OccupantContentStateReport = {
      occupantId: 'leadership-message',
      kind: 'strong',
      summary: 'featured=1 secondary=2',
      itemCount: 3,
      reportedAt: 1700000000000,
    };

    render(
      <OccupantContentStateProvider>
        <Reporter report={report} />
        <SingleReader
          occupantId="leadership-message"
          onRead={(r) => {
            latest = r;
          }}
        />
      </OccupantContentStateProvider>,
    );

    expect(latest).toBeDefined();
    expect(latest?.kind).toBe('strong');
    expect(latest?.itemCount).toBe(3);
    expect(latest?.summary).toBe('featured=1 secondary=2');
  });

  it('keeps content-state, layout-comfort, and static-eligibility concerns separate (only report fields are surfaced)', () => {
    let mapSnapshot: ReadonlyMap<string, OccupantContentStateReport> | undefined;
    const report: OccupantContentStateReport = {
      occupantId: 'company-pulse',
      kind: 'low-signal',
      itemCount: 1,
      reportedAt: 1700000000001,
    };
    render(
      <OccupantContentStateProvider>
        <Reporter report={report} />
        <Inspector onRead={(m) => (mapSnapshot = m)} />
      </OccupantContentStateProvider>,
    );
    expect(mapSnapshot?.get('company-pulse')?.kind).toBe('low-signal');
    // The map never carries comfort or eligibility fields.
    const raw = mapSnapshot?.get('company-pulse');
    expect(raw && 'reason' in raw).toBe(false);
    expect(raw && 'firstLaneEligible' in raw).toBe(false);
  });

  it('toOccupantContentStateDataAttributes emits shell-safe inspectable attrs', () => {
    expect(toOccupantContentStateDataAttributes(undefined)).toEqual({
      'data-shell-occupant-content-state': 'unknown',
    });
    expect(
      toOccupantContentStateDataAttributes({
        occupantId: 'leadership-message',
        kind: 'empty',
        summary: 'no-entries',
        reportedAt: 0,
      }),
    ).toEqual({
      'data-shell-occupant-content-state': 'empty',
      'data-shell-occupant-content-summary': 'no-entries',
    });
  });

  it('reports update when a reporter re-publishes a new kind', () => {
    let latest: OccupantContentStateReport | undefined;
    const first: OccupantContentStateReport = {
      occupantId: 'leadership-message',
      kind: 'empty',
      summary: 'no-entries',
      itemCount: 0,
      reportedAt: 1,
    };
    const second: OccupantContentStateReport = {
      occupantId: 'leadership-message',
      kind: 'strong',
      summary: 'featured=1 secondary=0',
      itemCount: 1,
      reportedAt: 2,
    };

    const { rerender } = render(
      <OccupantContentStateProvider>
        <Reporter report={first} />
        <SingleReader
          occupantId="leadership-message"
          onRead={(r) => {
            latest = r;
          }}
        />
      </OccupantContentStateProvider>,
    );
    expect(latest?.kind).toBe('empty');

    act(() => {
      rerender(
        <OccupantContentStateProvider>
          <Reporter report={second} />
          <SingleReader
            occupantId="leadership-message"
            onRead={(r) => {
              latest = r;
            }}
          />
        </OccupantContentStateProvider>,
      );
    });
    expect(latest?.kind).toBe('strong');
    expect(latest?.itemCount).toBe(1);
  });
});
