import * as React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSurface = vi.fn();

vi.mock('@hbc/ui-kit/homepage', () => {
  const Icon = (): React.JSX.Element => <svg />;
  return {
    HbcPriorityRailSurface: (props: unknown): React.JSX.Element => {
      mockSurface(props);
      return <div data-testid="priority-rail-surface" />;
    },
    HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT: {
      ultrawide: 6,
      desktop: 5,
      'tablet-landscape': 4,
      'tablet-portrait': 4,
      phone: 3,
    },
    HbcPriorityRailSkeleton: (): React.JSX.Element => <div role="status" />,
    HbcPriorityRailEmptyState: ({ title }: { title?: string }): React.JSX.Element => <div>{title ?? 'empty'}</div>,
    HbcPriorityRailErrorState: (): React.JSX.Element => <div>error</div>,
    AlertTriangle: Icon,
    AlertCircle: Icon,
    CheckCircle2: Icon,
    ArrowRight: Icon,
  };
});

vi.mock('../data/spContext.js', () => ({
  getSiteUrl: () => 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
}));

vi.mock('../data/usePriorityActionsData.js', () => ({
  usePriorityActionsData: () => ({
    config: {
      id: 1,
      title: 'Priority Actions',
      bandKey: 'homepage-primary',
      enabled: true,
      isActive: true,
      headingText: 'Priority Actions',
      overflowLabel: 'More tools',
      showHeading: true,
      showBadges: true,
      desktopLayoutMode: 'segmented',
      tabletLayoutMode: 'hybrid',
      mobileLayoutMode: 'grid',
      maxVisibleDesktop: 5,
      maxVisibleLaptop: 4,
      maxVisibleTabletLandscape: 3,
      maxVisibleTabletPortrait: 2,
      maxVisiblePhone: 1,
      openExternalInNewTabByDefault: true,
      adminNotes: '',
      modified: '2026-04-17T00:00:00Z',
    },
    items: [
      {
        id: 10,
        actionKey: 'approve-rfi',
        title: 'Approve RFI',
        href: '/rfi',
        description: '',
        iconKey: '',
        badgeLabel: '',
        badgeVariant: 'warning',
        priority: 'primary',
        groupKey: 'approvals',
        groupTitle: 'Approvals',
        sortOrder: 1,
        overflowOnly: false,
        mobilePriority: 1,
        audienceMode: 'all',
        audienceKeys: [],
        isExternal: false,
        openInNewTab: false,
        visibleDesktop: true,
        visibleLaptop: true,
        visibleTabletLandscape: true,
        visibleTabletPortrait: true,
        visiblePhone: true,
        startsAtUtc: null,
        endsAtUtc: null,
      },
      {
        id: 11,
        actionKey: 'safety-review',
        title: 'Safety Review',
        href: '/safety',
        description: '',
        iconKey: '',
        badgeLabel: '',
        badgeVariant: 'neutral',
        priority: 'primary',
        groupKey: 'safety',
        groupTitle: 'Safety',
        sortOrder: 2,
        overflowOnly: false,
        mobilePriority: 2,
        audienceMode: 'all',
        audienceKeys: [],
        isExternal: false,
        openInNewTab: false,
        visibleDesktop: true,
        visibleLaptop: true,
        visibleTabletLandscape: true,
        visibleTabletPortrait: true,
        visiblePhone: true,
        startsAtUtc: null,
        endsAtUtc: null,
      },
    ],
    isLoading: false,
    error: undefined,
  }),
  invalidatePriorityActionsCache: vi.fn(),
}));

import { PriorityActionsRail } from '../../webparts/priorityActionsRail/PriorityActionsRail.js';

let resizeCallback: ResizeObserverCallback | undefined;

class ResizeObserverMock {
  private readonly callback: ResizeObserverCallback;

  public constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    resizeCallback = callback;
  }

  public observe(): void {
    // no-op
  }

  public disconnect(): void {
    // no-op
  }
}

describe('PriorityActionsRail runtime mapping', () => {
  beforeEach(() => {
    mockSurface.mockClear();
    resizeCallback = undefined;
    Object.defineProperty(window, 'innerWidth', { value: 1900, configurable: true, writable: true });
    // @ts-expect-error test shim overrides optional browser API in jsdom
    globalThis.ResizeObserver = ResizeObserverMock;
  });

  it('uses container-aware device resolution and passes grouped sections + normalized mobile mapping', async () => {
    render(<PriorityActionsRail />);

    await waitFor(() => {
      expect(mockSurface).toHaveBeenCalled();
    });

    act(() => {
      resizeCallback?.([
        {
          contentRect: { width: 700, height: 820 },
          contentBoxSize: [{ inlineSize: 700, blockSize: 820 }],
        } as unknown as ResizeObserverEntry,
      ], {} as ResizeObserver);
    });

    await waitFor(() => {
      const latest = mockSurface.mock.calls.at(-1)?.[0] as {
        layout: string;
        overflowStrategy: string;
        sections?: Array<{ key: string }>;
      };
      expect(latest.layout).toBe('rail');
      expect(latest.overflowStrategy).toBe('sheet');
      expect(latest.sections).toBeUndefined();
    });
  });

  it('defaults surfaceContext to "default" for standalone / non-homepage mounts', async () => {
    render(<PriorityActionsRail />);
    await waitFor(() => {
      expect(mockSurface).toHaveBeenCalled();
    });
    const latest = mockSurface.mock.calls.at(-1)?.[0] as { context?: string };
    expect(latest.context).toBe('default');
  });

  it('threads surfaceContext="homepage-flagship" into the shared surface when the wrapper opts in', async () => {
    render(<PriorityActionsRail surfaceContext="homepage-flagship" />);
    await waitFor(() => {
      expect(mockSurface).toHaveBeenCalled();
    });
    const latest = mockSurface.mock.calls.at(-1)?.[0] as { context?: string };
    expect(latest.context).toBe('homepage-flagship');
  });

  it('preserves rail layout + drawer overflow under short-height breakpoint (regression guard)', async () => {
    render(<PriorityActionsRail surfaceContext="homepage-flagship" />);
    await waitFor(() => {
      expect(mockSurface).toHaveBeenCalled();
    });
    act(() => {
      resizeCallback?.(
        [
          {
            contentRect: { width: 1000, height: 420 },
            contentBoxSize: [{ inlineSize: 1000, blockSize: 420 }],
          } as unknown as ResizeObserverEntry,
        ],
        {} as ResizeObserver,
      );
    });
    await waitFor(() => {
      const latest = mockSurface.mock.calls.at(-1)?.[0] as {
        layout: string;
        overflowStrategy: string;
        context?: string;
      };
      expect(latest.layout).toBe('rail');
      expect(latest.overflowStrategy).toBe('sheet');
      expect(latest.context).toBe('homepage-flagship');
    });
  });
});
