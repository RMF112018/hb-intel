import { createContext, useContext, useMemo, type FC, type ReactNode } from 'react';
import {
  PCC_BENTO_GRID_GAP_PX,
  PCC_BENTO_GRID_ROW_UNIT_PX,
  PCC_RESPONSIVE_COLUMNS,
  type PccResponsiveMode,
} from './footprints';
import { useContainerBreakpoint } from './useContainerBreakpoint';
import styles from './PccBentoGrid.module.css';

export interface PccBentoContextValue {
  mode: PccResponsiveMode;
  columns: number;
  rowUnitPx: number;
  gapPx: number;
}

const PccBentoContext = createContext<PccBentoContextValue | null>(null);

export function usePccBentoContext(): PccBentoContextValue {
  const ctx = useContext(PccBentoContext);
  if (!ctx) {
    throw new Error('usePccBentoContext must be used inside <PccBentoGrid>');
  }
  return ctx;
}

export interface PccBentoGridProps {
  children: ReactNode;
  /** Optional override for the resolved responsive mode — used by tests. */
  forceMode?: PccResponsiveMode;
}

export const PccBentoGrid: FC<PccBentoGridProps> = ({ children, forceMode }) => {
  const { ref, mode } = useContainerBreakpoint();
  const activeMode = forceMode ?? mode;
  const columns = PCC_RESPONSIVE_COLUMNS[activeMode];

  const ctxValue = useMemo<PccBentoContextValue>(
    () => ({
      mode: activeMode,
      columns,
      rowUnitPx: PCC_BENTO_GRID_ROW_UNIT_PX,
      gapPx: PCC_BENTO_GRID_GAP_PX,
    }),
    [activeMode, columns],
  );

  const gridStyle = {
    '--pcc-grid-columns': String(columns),
    '--pcc-grid-row-unit': `${PCC_BENTO_GRID_ROW_UNIT_PX}px`,
    '--pcc-grid-gap': `${PCC_BENTO_GRID_GAP_PX}px`,
    '--pcc-grid-safe-min-col': activeMode === 'phone' ? '0px' : '120px',
  } as React.CSSProperties;

  return (
    <PccBentoContext.Provider value={ctxValue}>
      <div
        ref={ref}
        className={styles.grid}
        data-pcc-bento-grid=""
        data-pcc-mode={activeMode}
        data-pcc-grid-safety="enabled"
        style={gridStyle}
      >
        {children}
      </div>
    </PccBentoContext.Provider>
  );
};

export default PccBentoGrid;
