import React from 'react';

/**
 * Project Sites responsive contract.
 *
 * The public mode names (`wide` | `medium` | `compact`) are preserved, but
 * the contract is factored along two orthogonal axes so later responsive
 * work can reason about *why* a mode was chosen:
 *
 *   - `ProjectSitesDisplayClass` — width-class authority (`phone`, `tablet`,
 *     `desktop`, `wide-desktop`).
 *   - `ProjectSitesHeightClass` — viewport-height authority (`short`,
 *     `standard`). A short height collapses the surface to `compact` even
 *     when the container is otherwise wide, because host-embedded SPFx
 *     renders frequently expose short iframe heights.
 *
 * `PROJECT_SITES_MODE_RESPONSIBILITIES` is the authoritative responsibility
 * record consumed by the root, control-band, and card surfaces. Later
 * Wave-01 prompts (03–07) refine individual responsibility fields; they do
 * not invent new mode names.
 */
export type ProjectSitesLayoutMode = 'compact' | 'medium' | 'wide';

export type ProjectSitesDisplayClass =
  | 'phone'
  | 'tablet'
  | 'desktop'
  | 'wide-desktop';

export type ProjectSitesHeightClass = 'short' | 'standard';

export type ProjectSitesControlBandStrategy =
  | 'inline-row'
  | 'two-lane'
  | 'stacked-disclosure';

export type ProjectSitesCardDensity = 'comfortable' | 'regular' | 'condensed';

export type ProjectSitesGridStrategy =
  | 'multi-column-auto-fill'
  | 'balanced-auto-fill'
  | 'single-column';

export type ProjectSitesSparseStrategy =
  | 'bounded-card-width'
  | 'natural-flow'
  | 'single-column';

export interface ProjectSitesModeResponsibility {
  /** How the search / scope / sort / filter band composes. */
  readonly controlBand: ProjectSitesControlBandStrategy;
  /** Default card density for this mode. */
  readonly cardDensity: ProjectSitesCardDensity;
  /** Grid column strategy for the normal (non-sparse) result set. */
  readonly grid: ProjectSitesGridStrategy;
  /** Grid column strategy when only 1–2 results are visible. */
  readonly sparse: ProjectSitesSparseStrategy;
  /** One-line description used in docs/diagnostics, not UX copy. */
  readonly summary: string;
}

export interface ProjectSitesLayoutDimensions {
  width: number;
  height: number;
}

export interface ProjectSitesContainerState {
  width: number;
  height: number;
  mode: ProjectSitesLayoutMode;
  displayClass: ProjectSitesDisplayClass;
  heightClass: ProjectSitesHeightClass;
  isShortHeight: boolean;
}

export const PROJECT_SITES_WIDE_MIN_WIDTH = 1180;
export const PROJECT_SITES_MEDIUM_MIN_WIDTH = 820;
export const PROJECT_SITES_WIDE_DESKTOP_MIN_WIDTH = 1600;
export const PROJECT_SITES_SHORT_HEIGHT_MAX = 559;

export const PROJECT_SITES_MODE_RESPONSIBILITIES: Record<
  ProjectSitesLayoutMode,
  ProjectSitesModeResponsibility
> = {
  wide: {
    controlBand: 'inline-row',
    cardDensity: 'comfortable',
    grid: 'multi-column-auto-fill',
    sparse: 'bounded-card-width',
    summary:
      'Desktop and wide-desktop containers: inline control band, multi-column auto-fill grid, bounded sparse width.',
  },
  medium: {
    controlBand: 'two-lane',
    cardDensity: 'regular',
    grid: 'balanced-auto-fill',
    sparse: 'natural-flow',
    summary:
      'Tablet / transitional containers: two-lane control band (search primary, scope+sort+filters secondary), balanced grid.',
  },
  compact: {
    controlBand: 'stacked-disclosure',
    cardDensity: 'condensed',
    grid: 'single-column',
    sparse: 'single-column',
    summary:
      'Narrow width or short-height containers: stacked controls with filter disclosure, single-column grid, condensed card density.',
  },
};

export function resolveProjectSitesDisplayClass(
  width: number,
): ProjectSitesDisplayClass {
  if (width >= PROJECT_SITES_WIDE_DESKTOP_MIN_WIDTH) return 'wide-desktop';
  if (width >= PROJECT_SITES_WIDE_MIN_WIDTH) return 'desktop';
  if (width >= PROJECT_SITES_MEDIUM_MIN_WIDTH) return 'tablet';
  return 'phone';
}

export function resolveProjectSitesHeightClass(
  height: number,
): ProjectSitesHeightClass {
  return height <= PROJECT_SITES_SHORT_HEIGHT_MAX ? 'short' : 'standard';
}

const DEFAULT_STATE: ProjectSitesContainerState = {
  width: 1280,
  height: 900,
  mode: 'wide',
  displayClass: 'desktop',
  heightClass: 'standard',
  isShortHeight: false,
};

function readViewportHeight(): number {
  if (typeof window === 'undefined') return DEFAULT_STATE.height;
  const visualHeight = window.visualViewport?.height;
  if (typeof visualHeight === 'number' && Number.isFinite(visualHeight) && visualHeight > 0) {
    return visualHeight;
  }
  const innerHeight = window.innerHeight;
  if (typeof innerHeight === 'number' && Number.isFinite(innerHeight) && innerHeight > 0) {
    return innerHeight;
  }
  return DEFAULT_STATE.height;
}

function normalizePositiveDimension(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return Math.round(value);
}

export function resolveProjectSitesLayoutMode(
  dimensions: ProjectSitesLayoutDimensions,
): ProjectSitesLayoutMode {
  const { width, height } = dimensions;
  if (height <= PROJECT_SITES_SHORT_HEIGHT_MAX) return 'compact';
  if (width >= PROJECT_SITES_WIDE_MIN_WIDTH) return 'wide';
  if (width >= PROJECT_SITES_MEDIUM_MIN_WIDTH) return 'medium';
  return 'compact';
}

export function resolveProjectSitesContainerState(
  dimensions: ProjectSitesLayoutDimensions,
): ProjectSitesContainerState {
  const width = normalizePositiveDimension(dimensions.width, DEFAULT_STATE.width);
  const height = normalizePositiveDimension(dimensions.height, DEFAULT_STATE.height);
  const heightClass = resolveProjectSitesHeightClass(height);
  return {
    width,
    height,
    mode: resolveProjectSitesLayoutMode({ width, height }),
    displayClass: resolveProjectSitesDisplayClass(width),
    heightClass,
    isShortHeight: heightClass === 'short',
  };
}

export function useProjectSitesContainerState(
  ref: React.RefObject<HTMLElement | null>,
): ProjectSitesContainerState {
  const [state, setState] = React.useState<ProjectSitesContainerState>(DEFAULT_STATE);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = (width: number): void => {
      const next = resolveProjectSitesContainerState({
        width,
        // Use viewport height as the short-height authority so ordinary
        // content growth/shrink does not feed back into mode selection.
        height: readViewportHeight(),
      });
      setState((prev) => {
        if (
          prev.width === next.width &&
          prev.height === next.height &&
          prev.mode === next.mode &&
          prev.displayClass === next.displayClass &&
          prev.heightClass === next.heightClass &&
          prev.isShortHeight === next.isShortHeight
        ) {
          return prev;
        }
        return next;
      });
    };

    const updateFromMeasuredWidth = (): void => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) update(rect.width);
    };

    const rect = el.getBoundingClientRect();
    if (rect.width > 0) {
      update(rect.width);
    }

    const onWindowResize = updateFromMeasuredWidth;
    window.addEventListener('resize', onWindowResize);

    // Propagate viewport-height changes (on-screen keyboard, iframe
    // resize, SharePoint host split-view) to the short-height axis
    // without waiting for a container-width ResizeObserver tick. Width
    // authority still comes from the measured container.
    const visualViewport =
      typeof window !== 'undefined' ? window.visualViewport : undefined;
    if (visualViewport) {
      visualViewport.addEventListener('resize', updateFromMeasuredWidth);
    }

    if (typeof ResizeObserver === 'undefined') {
      return () => {
        window.removeEventListener('resize', onWindowResize);
        if (visualViewport) {
          visualViewport.removeEventListener('resize', updateFromMeasuredWidth);
        }
      };
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          update(width);
        }
      }
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onWindowResize);
      if (visualViewport) {
        visualViewport.removeEventListener('resize', updateFromMeasuredWidth);
      }
    };
  }, [ref]);

  return state;
}
