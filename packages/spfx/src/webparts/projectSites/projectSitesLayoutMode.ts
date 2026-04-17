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
  const isShortHeight = dimensions.height <= PROJECT_SITES_SHORT_HEIGHT_MAX;
  return {
    width: dimensions.width,
    height: dimensions.height,
    mode: resolveProjectSitesLayoutMode(dimensions),
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

    const update = (width: number, height: number): void => {
      setState(resolveProjectSitesContainerState({ width, height }));
    };

    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      update(rect.width, rect.height);
    }

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        if (width > 0 && height > 0) {
          update(width, height);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return state;
}
