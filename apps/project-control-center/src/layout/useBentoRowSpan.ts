import { useEffect, useRef, useState, type RefObject } from 'react';
import { PCC_BENTO_GRID_GAP_PX, PCC_BENTO_GRID_ROW_UNIT_PX } from './footprints';

export interface UseBentoRowSpanResult {
  ref: RefObject<HTMLDivElement>;
  rowSpan: number;
  measuredHeight: number;
}

export function useBentoRowSpan(initialMinRows = 4): UseBentoRowSpanResult {
  const ref = useRef<HTMLDivElement>(null);
  const [rowSpan, setRowSpan] = useState(initialMinRows);
  const [measuredHeight, setMeasuredHeight] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const observedHeight = entry.contentBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      // Break the constrained-measurement feedback loop: when the card
      // body is clipped by the current grid cell (`grid-auto-rows × span`),
      // ResizeObserver reports the constrained box height, which would
      // otherwise drive the next span calculation back down and keep
      // the cell at 8px. `scrollHeight` reports the intrinsic content
      // extent regardless of the parent clip, so taking the max of
      // the two recovers from the constrained state on the next tick.
      const intrinsicHeight = typeof node.scrollHeight === 'number' ? node.scrollHeight : 0;
      const rawHeight = Math.max(observedHeight, intrinsicHeight);
      const height = Number.isFinite(rawHeight) && rawHeight > 0 ? rawHeight : 0;
      setMeasuredHeight(height);
      // Floor at `initialMinRows`. The row span is the hook's documented
      // minimum vertical posture, not a value ResizeObserver can shrink.
      const span = Math.max(
        initialMinRows,
        Math.ceil(
          (height + PCC_BENTO_GRID_GAP_PX) / (PCC_BENTO_GRID_ROW_UNIT_PX + PCC_BENTO_GRID_GAP_PX),
        ),
      );
      setRowSpan(span);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [initialMinRows]);

  return { ref, rowSpan, measuredHeight };
}
