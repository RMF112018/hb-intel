import {
  createContext,
  useContext,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  MY_WORK_RESPONSIVE_COLUMNS,
} from './myWorkFootprints.js';
import type { MyWorkResponsiveMode } from './useMyWorkContainerBreakpoint.js';
import styles from './MyWorkBentoGrid.module.css';

export const MY_WORK_BENTO_GRID_ROW_UNIT_PX = 96;
export const MY_WORK_BENTO_GRID_GAP_PX = 16;

export interface MyWorkBentoContextValue {
  readonly mode: MyWorkResponsiveMode;
  readonly columns: number;
  readonly rowUnitPx: number;
  readonly gapPx: number;
}

const MyWorkBentoContext = createContext<MyWorkBentoContextValue | null>(null);

/**
 * Access the surrounding bento grid's mode, columns, and layout primitives.
 * Throws when called outside a `<MyWorkBentoGrid>` provider so card consumers
 * cannot silently render with stale assumptions.
 */
export function useMyWorkBentoContext(): MyWorkBentoContextValue {
  const ctx = useContext(MyWorkBentoContext);
  if (!ctx) {
    throw new Error('useMyWorkBentoContext must be used inside a <MyWorkBentoGrid> provider');
  }
  return ctx;
}

export interface MyWorkBentoGridProps {
  readonly mode: MyWorkResponsiveMode;
  readonly children?: ReactNode;
  readonly className?: string;
}

export function MyWorkBentoGrid({ mode, children, className }: MyWorkBentoGridProps) {
  const columns = MY_WORK_RESPONSIVE_COLUMNS[mode];

  const ctx = useMemo<MyWorkBentoContextValue>(
    () => ({
      mode,
      columns,
      rowUnitPx: MY_WORK_BENTO_GRID_ROW_UNIT_PX,
      gapPx: MY_WORK_BENTO_GRID_GAP_PX,
    }),
    [mode, columns],
  );

  const gridStyle: CSSProperties = {
    '--my-work-grid-columns': String(columns),
    '--my-work-grid-row-unit': `${MY_WORK_BENTO_GRID_ROW_UNIT_PX}px`,
    '--my-work-grid-gap': `${MY_WORK_BENTO_GRID_GAP_PX}px`,
  } as CSSProperties;

  const composedClassName = className ? `${styles.grid} ${className}` : styles.grid;

  return (
    <div
      className={composedClassName}
      style={gridStyle}
      data-my-work-bento-grid=""
      data-my-work-mode={mode}
    >
      <MyWorkBentoContext.Provider value={ctx}>{children}</MyWorkBentoContext.Provider>
    </div>
  );
}

export default MyWorkBentoGrid;
