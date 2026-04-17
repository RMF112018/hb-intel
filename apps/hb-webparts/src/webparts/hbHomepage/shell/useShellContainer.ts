import * as React from 'react';
import { resolveEntryState } from './breakpointPolicy.js';
import type { ShellEntryState } from './shellTypes.js';

export interface ShellContainerState {
  readonly width: number;
  readonly height: number;
  readonly entryState: ShellEntryState;
}

const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 800;

export function useShellContainer(
  ref: React.RefObject<HTMLElement | null>,
): ShellContainerState {
  const [dimensions, setDimensions] = React.useState<{ width: number; height: number }>({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { inlineSize, blockSize } = entry.contentBoxSize[0];
        setDimensions({ width: inlineSize, height: blockSize });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  const entryState = React.useMemo(
    () => resolveEntryState({ width: dimensions.width, height: dimensions.height }),
    [dimensions.width, dimensions.height],
  );

  return { width: dimensions.width, height: dimensions.height, entryState };
}
