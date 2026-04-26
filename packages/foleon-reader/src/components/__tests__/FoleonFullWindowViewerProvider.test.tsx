import * as React from 'react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, cleanup, fireEvent, screen, act, waitFor } from '@testing-library/react';
import { createFoleonOriginPolicy } from '../../services/FoleonOriginPolicy.js';
import {
  FoleonFullWindowViewerProvider,
  useFoleonFullWindowViewer,
} from '../FoleonFullWindowViewerProvider.js';
import {
  createPreviewFoleonViewerTarget,
  createReadyFoleonViewerTarget,
  type FoleonViewerOpenResult,
  type FoleonViewerTarget,
} from '../../readers/FoleonViewerTypes.js';
import { FOLEON_READER_CONFIGS } from '../../readers/readerConfigs.js';
import type { FoleonContentRecord } from '../../types/foleon-content.types.js';

beforeAll(() => {
  if (typeof window !== 'undefined' && !window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }),
    });
  }
});

afterEach(() => cleanup());

const POLICY = createFoleonOriginPolicy(['https://viewer.us.foleon.com']);

function readyTarget(overrides: Partial<FoleonContentRecord> = {}): FoleonViewerTarget {
  const record: FoleonContentRecord = {
    id: 1,
    title: 'Hosted edition',
    foleonDocId: 1001,
    contentTypeKey: 'Project Spotlight',
    readerKey: 'project-spotlight',
    publishStatus: 'Published',
    isVisible: true,
    isFeatured: true,
    isHomepageEligible: true,
    publishedUrl: 'https://viewer.us.foleon.com/published/edition',
    embedUrl: 'https://viewer.us.foleon.com/embed/edition',
    summary: 'Summary.',
    publishedOn: '2026-04-20T00:00:00.000Z',
    archiveGroup: '2026-04',
    activeEdition: true,
    primaryAudience: 'Companywide',
    openMode: 'Inline Reader',
    allowEmbed: true,
    requiresExternalOpen: false,
    syncSource: 'Manual',
    ...overrides,
  };
  return createReadyFoleonViewerTarget({
    config: FOLEON_READER_CONFIGS.projectSpotlight,
    record,
  });
}

interface HarnessHandle {
  open: (target: FoleonViewerTarget, launch?: HTMLElement | null) => FoleonViewerOpenResult | null;
  close: () => void;
}

function Harness(props: { handle: { current: HarnessHandle | null } }): React.JSX.Element {
  const viewer = useFoleonFullWindowViewer();
  React.useEffect(() => {
    props.handle.current = {
      open: (target, launch) => viewer.openViewer(target, launch),
      close: () => viewer.closeViewer(),
    };
    return (): void => {
      props.handle.current = null;
    };
  }, [props.handle, viewer]);
  return <div data-testid="harness">{viewer.currentTarget ? 'open' : 'closed'}</div>;
}

describe('FoleonFullWindowViewerProvider — open/close + structured result', () => {
  it('openViewer on a canOpen=true target renders the dialog and emits onViewerOpen', () => {
    const onViewerOpen = vi.fn();
    const onViewerClose = vi.fn();
    const handle: { current: HarnessHandle | null } = { current: null };
    render(
      <FoleonFullWindowViewerProvider
        originPolicy={POLICY}
        onViewerOpen={onViewerOpen}
        onViewerClose={onViewerClose}
      >
        <Harness handle={handle} />
      </FoleonFullWindowViewerProvider>,
    );
    const target = readyTarget();
    let result: FoleonViewerOpenResult | null = null;
    act(() => {
      result = handle.current!.open(target);
    });
    expect(result).toEqual({ opened: true, target });
    expect(onViewerOpen).toHaveBeenCalledWith(target);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(document.querySelector('[data-foleon-full-window-viewer="active"]')).not.toBeNull();
  });

  it('openViewer on a canOpen=false target returns { opened: false, reason } and does NOT render the dialog', () => {
    const onViewerOpen = vi.fn();
    const handle: { current: HarnessHandle | null } = { current: null };
    render(
      <FoleonFullWindowViewerProvider originPolicy={POLICY} onViewerOpen={onViewerOpen}>
        <Harness handle={handle} />
      </FoleonFullWindowViewerProvider>,
    );
    const target = createPreviewFoleonViewerTarget(FOLEON_READER_CONFIGS.projectSpotlight);
    let result: FoleonViewerOpenResult | null = null;
    act(() => {
      result = handle.current!.open(target);
    });
    expect(result).toEqual({ opened: false, reason: 'preview-only' });
    expect(onViewerOpen).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('disabled "embed-not-allowed" target also returns the structured reason', () => {
    const handle: { current: HarnessHandle | null } = { current: null };
    render(
      <FoleonFullWindowViewerProvider originPolicy={POLICY}>
        <Harness handle={handle} />
      </FoleonFullWindowViewerProvider>,
    );
    const target = readyTarget({ allowEmbed: false });
    let result: FoleonViewerOpenResult | null = null;
    act(() => {
      result = handle.current!.open(target);
    });
    expect(result).toEqual({ opened: false, reason: 'embed-not-allowed' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closeViewer removes the dialog, fires onViewerClose, and returns focus to the launch element', async () => {
    const onViewerClose = vi.fn();
    const handle: { current: HarnessHandle | null } = { current: null };
    render(
      <FoleonFullWindowViewerProvider originPolicy={POLICY} onViewerClose={onViewerClose}>
        <button type="button" data-testid="launch">
          Launch
        </button>
        <Harness handle={handle} />
      </FoleonFullWindowViewerProvider>,
    );
    const launch = screen.getByTestId('launch');
    const target = readyTarget();
    act(() => {
      handle.current!.open(target, launch);
    });
    expect(screen.getByRole('dialog')).toBeTruthy();
    act(() => {
      handle.current!.close();
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onViewerClose).toHaveBeenCalledWith(target);
    await waitFor(() => expect(document.activeElement).toBe(launch));
  });

  it('Escape closes the viewer', () => {
    const onViewerClose = vi.fn();
    const handle: { current: HarnessHandle | null } = { current: null };
    render(
      <FoleonFullWindowViewerProvider originPolicy={POLICY} onViewerClose={onViewerClose}>
        <Harness handle={handle} />
      </FoleonFullWindowViewerProvider>,
    );
    act(() => {
      handle.current!.open(readyTarget());
    });
    expect(screen.getByRole('dialog')).toBeTruthy();
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onViewerClose).toHaveBeenCalled();
  });

  it('useFoleonFullWindowViewer outside any provider returns a structured-refusal default — no silent no-op', () => {
    const handle: { current: HarnessHandle | null } = { current: null };
    render(<Harness handle={handle} />);
    const target = readyTarget();
    const captured = { result: null as FoleonViewerOpenResult | null };
    act(() => {
      captured.result = handle.current!.open(target);
    });
    // No provider in scope. The default openViewer returns a structured refusal,
    // not a silent no-op. Reason falls back to "unknown" when the target itself
    // has no disabledReason.
    const result = captured.result;
    expect(result).not.toBeNull();
    expect(result?.opened).toBe(false);
    if (result && result.opened === false) {
      expect(result.reason).toBe('unknown');
    }
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('iframe is mounted via FoleonIframeHost (descriptive title) when target.canOpen is true', () => {
    const handle: { current: HarnessHandle | null } = { current: null };
    render(
      <FoleonFullWindowViewerProvider originPolicy={POLICY}>
        <Harness handle={handle} />
      </FoleonFullWindowViewerProvider>,
    );
    act(() => {
      handle.current!.open(readyTarget({ title: 'The Seaglass Residence' }));
    });
    const iframe = document.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('title')).toBe('The Seaglass Residence — Foleon viewer');
  });
});
