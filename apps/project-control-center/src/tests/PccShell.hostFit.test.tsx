import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { PccApp } from '../PccApp';

// Phase 08 Prompt 03 — Shell and Host-Fit Enhancement.
// These tests lock the shell as the sole owner of the active-panel marker,
// guarantee no sidebar / left-rail / host-takeover structure exists under
// the PCC shell host-fit boundary, and confirm the bento grid mounts as a
// descendant of the active tabpanel. The new `[data-pcc-shell-host-fit]`
// and `[data-pcc-canvas]` markers provide stable evidence/test selectors
// for the contained product surface introduced by the Prompt 03 visual
// refinement (token-driven shell elevation + layered canvas seam).

describe('PccShell host-fit (Phase 08 Prompt 03)', () => {
  // PCC SPFx vitest runs with `globals: false` and does not auto-cleanup
  // jsdom between tests. Explicit cleanup keeps each assertion scoped to
  // its own render.
  afterEach(() => {
    cleanup();
  });

  it('renders exactly one shell host-fit marker at the shell root', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const shells = container.querySelectorAll('[data-pcc-shell-host-fit]');
    expect(shells, 'shell host-fit marker should appear exactly once').toHaveLength(1);
    const shell = shells[0]!;
    expect(shell.getAttribute('data-pcc-shell')).toBe('thin');
  });

  it('canvas marker resolves to the active tabpanel', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const canvases = container.querySelectorAll('[data-pcc-canvas]');
    expect(canvases, 'canvas marker should appear exactly once').toHaveLength(1);
    const canvas = canvases[0]!;
    expect(canvas.tagName).toBe('MAIN');
    expect(canvas.getAttribute('role')).toBe('tabpanel');
    expect(canvas.getAttribute('data-pcc-active-surface-panel')).not.toBeNull();
  });

  it('active-surface-panel marker appears exactly once across the rendered shell', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(
      panels,
      'data-pcc-active-surface-panel must appear exactly once and on the shell main element',
    ).toHaveLength(1);
    expect(panels[0]!.tagName).toBe('MAIN');
  });

  it('contains no sidebar, rail, or complementary navigation structure under shell host-fit', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const shell = container.querySelector('[data-pcc-shell-host-fit]') as HTMLElement | null;
    expect(shell, 'shell host-fit boundary must render').not.toBeNull();
    expect(shell!.querySelectorAll('aside')).toHaveLength(0);
    expect(shell!.querySelectorAll('[role="navigation"]')).toHaveLength(0);
    expect(shell!.querySelectorAll('[role="complementary"]')).toHaveLength(0);
  });

  it('contains no host-takeover positioning under shell host-fit', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const shell = container.querySelector('[data-pcc-shell-host-fit]') as HTMLElement | null;
    expect(shell, 'shell host-fit boundary must render').not.toBeNull();
    const fixed = Array.from(shell!.querySelectorAll<HTMLElement>('*')).filter(
      (node) => node.style.position === 'fixed',
    );
    expect(fixed, 'no descendant should declare inline position: fixed').toHaveLength(0);
  });

  it('mounts the bento grid as a descendant of the active tabpanel', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const panel = container.querySelector(
      'main[role="tabpanel"][data-pcc-canvas]',
    ) as HTMLElement | null;
    expect(panel, 'active tabpanel with canvas marker must render').not.toBeNull();
    const grid = panel!.querySelector('[data-pcc-bento-grid]');
    expect(grid, 'bento grid must mount as a descendant of the active tabpanel').not.toBeNull();
  });
});
