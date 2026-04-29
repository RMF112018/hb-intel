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
      const height = entry.contentBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      setMeasuredHeight(height);
      const span = Math.max(
        1,
        Math.ceil(
          (height + PCC_BENTO_GRID_GAP_PX) /
            (PCC_BENTO_GRID_ROW_UNIT_PX + PCC_BENTO_GRID_GAP_PX),
        ),
      );
      setRowSpan(span);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, rowSpan, measuredHeight };
}
