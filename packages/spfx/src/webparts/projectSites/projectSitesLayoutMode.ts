import React from 'react';

export type ProjectSitesLayoutMode = 'compact' | 'medium' | 'wide';

export interface ProjectSitesLayoutDimensions {
  width: number;
  height: number;
}

export interface ProjectSitesContainerState {
  width: number;
  height: number;
  mode: ProjectSitesLayoutMode;
  isShortHeight: boolean;
}

export const PROJECT_SITES_WIDE_MIN_WIDTH = 1180;
export const PROJECT_SITES_MEDIUM_MIN_WIDTH = 820;
export const PROJECT_SITES_SHORT_HEIGHT_MAX = 559;

const DEFAULT_STATE: ProjectSitesContainerState = {
  width: 1280,
  height: 900,
  mode: 'wide',
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
  const isShortHeight = height <= PROJECT_SITES_SHORT_HEIGHT_MAX;
  return {
    width,
    height,
    mode: resolveProjectSitesLayoutMode({ width, height }),
    isShortHeight,
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
          prev.isShortHeight === next.isShortHeight
        ) {
          return prev;
        }
        return next;
      });
    };

    const rect = el.getBoundingClientRect();
    if (rect.width > 0) {
      update(rect.width);
    }

    if (typeof ResizeObserver === 'undefined') {
      const onWindowResize = (): void => update(el.getBoundingClientRect().width);
      window.addEventListener('resize', onWindowResize);
      return () => window.removeEventListener('resize', onWindowResize);
    }

    const onWindowResize = (): void => update(el.getBoundingClientRect().width);
    window.addEventListener('resize', onWindowResize);

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
    };
  }, [ref]);

  return state;
}
