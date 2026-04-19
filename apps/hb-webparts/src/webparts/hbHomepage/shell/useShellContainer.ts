import * as React from 'react';
import {
  resolveEntryStateWithReason,
  type EntryStateSelectionReason,
} from './breakpointPolicy.js';
import type { ShellEntryState } from './shellTypes.js';

/**
 * Inspectable measurement-source marker for shell width truth.
 */
export const SHELL_WIDTH_SOURCE = 'entry-stack-outer-envelope' as const;
/**
 * Inspectable accounting rule marker for usable shell width.
 */
export const SHELL_WIDTH_ACCOUNTING_RULE =
  'authoritative-minus-shell-inline-inset' as const;

export interface ShellContainerState {
  /** Authoritative usable width (authoritative outer width minus shell insets). */
  readonly width: number;
  /** Wrapper-owned outer envelope width before shell-body inset deduction. */
  readonly authoritativeWidth: number;
  /** Total inline inset deducted from authoritative width. */
  readonly shellInlineInsetTotal: number;
  readonly height: number;
  readonly entryState: ShellEntryState;
  /** Why `entryState` was selected; inspectable via shell diagnostics. */
  readonly entryStateReason: EntryStateSelectionReason;
  /** True when the phone-landscape short-height branch was taken. */
  readonly shortHeightConstrained: boolean;
}

export interface SharedEntryStateSnapshot {
  readonly entryState: ShellEntryState;
  readonly entryStateReason: EntryStateSelectionReason;
  readonly shortHeightConstrained: boolean;
}

/**
 * Shared entry-stack authority payload for the flagship hero path.
 * Mirrors wrapper-owned measurement + entry-state truth from the shell
 * container seam so hero, launcher, and shell can read one authority.
 */
export type HeroEntryStackState = Pick<
  ShellContainerState,
  | 'width'
  | 'authoritativeWidth'
  | 'shellInlineInsetTotal'
  | 'height'
  | 'entryState'
  | 'entryStateReason'
  | 'shortHeightConstrained'
>;

const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 800;

interface ShellMeasurements {
  readonly authoritativeWidth: number;
  readonly shellInlineInsetTotal: number;
  readonly height: number;
}

export function toSharedEntryStateSnapshot(
  state: Pick<ShellContainerState, 'entryState' | 'entryStateReason' | 'shortHeightConstrained'>,
): SharedEntryStateSnapshot {
  return {
    entryState: state.entryState,
    entryStateReason: state.entryStateReason,
    shortHeightConstrained: state.shortHeightConstrained,
  };
}

export function toHeroEntryStackState(state: ShellContainerState): HeroEntryStackState {
  return {
    width: state.width,
    authoritativeWidth: state.authoritativeWidth,
    shellInlineInsetTotal: state.shellInlineInsetTotal,
    height: state.height,
    entryState: state.entryState,
    entryStateReason: state.entryStateReason,
    shortHeightConstrained: state.shortHeightConstrained,
  };
}

function parsePixelValue(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function resolveUsableShellWidth(
  authoritativeWidth: number,
  shellInlineInsetTotal: number,
): number {
  return Math.max(0, authoritativeWidth - shellInlineInsetTotal);
}

function measureShell(
  shellElement: HTMLElement,
  authoritativeElement: HTMLElement,
): ShellMeasurements {
  const shellStyle = window.getComputedStyle(shellElement);
  const shellInlineInsetTotal =
    parsePixelValue(shellStyle.paddingLeft) + parsePixelValue(shellStyle.paddingRight);
  const authoritativeWidth = authoritativeElement.getBoundingClientRect().width;
  const height = shellElement.getBoundingClientRect().height;
  return {
    authoritativeWidth,
    shellInlineInsetTotal,
    height,
  };
}

export function useShellContainer(
  ref: React.RefObject<HTMLElement | null>,
  authoritativeRef?: React.RefObject<HTMLElement | null>,
): ShellContainerState {
  const [measurements, setMeasurements] = React.useState<ShellMeasurements>({
    authoritativeWidth: DEFAULT_WIDTH,
    shellInlineInsetTotal: 0,
    height: DEFAULT_HEIGHT,
  });

  React.useEffect(() => {
    const shellElement = ref.current;
    if (!shellElement) return;
    const authoritativeElement =
      authoritativeRef?.current ??
      (shellElement.closest('[data-hb-homepage-entry-stack="root"]') as HTMLElement | null) ??
      shellElement;

    const update = () => {
      setMeasurements(measureShell(shellElement, authoritativeElement));
    };

    update();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        for (const _entry of entries) {
          update();
        }
      });
      observer.observe(shellElement);
      if (authoritativeElement !== shellElement) {
        observer.observe(authoritativeElement);
      }
      return () => observer.disconnect();
    }

    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [ref, authoritativeRef]);

  const usableWidth = React.useMemo(
    () =>
      resolveUsableShellWidth(
        measurements.authoritativeWidth,
        measurements.shellInlineInsetTotal,
      ),
    [measurements.authoritativeWidth, measurements.shellInlineInsetTotal],
  );

  const resolved = React.useMemo(
    () => resolveEntryStateWithReason({ width: usableWidth, height: measurements.height }),
    [usableWidth, measurements.height],
  );

  return {
    width: usableWidth,
    authoritativeWidth: measurements.authoritativeWidth,
    shellInlineInsetTotal: measurements.shellInlineInsetTotal,
    height: measurements.height,
    entryState: resolved.state,
    entryStateReason: resolved.reason,
    shortHeightConstrained: resolved.shortHeightConstrained,
  };
}
