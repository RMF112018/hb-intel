import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, renderHook } from '@testing-library/react';
import {
  MY_WORK_BENTO_GRID_GAP_PX,
  MY_WORK_BENTO_GRID_ROW_UNIT_PX,
  MyWorkBentoGrid,
  useMyWorkBentoContext,
} from './MyWorkBentoGrid.js';
import { MY_WORK_RESPONSIVE_COLUMNS } from './myWorkFootprints.js';

afterEach(() => {
  cleanup();
});

function getGrid(container: HTMLElement) {
  return container.querySelector('[data-my-work-bento-grid]') as HTMLElement;
}

describe('MyWorkBentoGrid — data attributes and grid CSS variables', () => {
  it('exposes data-my-work-bento-grid and data-my-work-mode markers', () => {
    const { container } = render(<MyWorkBentoGrid mode="desktop" />);
    const grid = getGrid(container);
    expect(grid).not.toBeNull();
    expect(grid.getAttribute('data-my-work-mode')).toBe('desktop');
  });

  it('injects --my-work-grid-columns matching MY_WORK_RESPONSIVE_COLUMNS[mode]', () => {
    for (const mode of ['phone', 'standardLaptop', 'desktop'] as const) {
      const { container, unmount } = render(<MyWorkBentoGrid mode={mode} />);
      const grid = getGrid(container);
      expect(grid.style.getPropertyValue('--my-work-grid-columns')).toBe(
        String(MY_WORK_RESPONSIVE_COLUMNS[mode]),
      );
      unmount();
      cleanup();
    }
  });

  it('injects row-unit and gap CSS variables from the layout constants', () => {
    const { container } = render(<MyWorkBentoGrid mode="standardLaptop" />);
    const grid = getGrid(container);
    expect(grid.style.getPropertyValue('--my-work-grid-row-unit')).toBe(
      `${MY_WORK_BENTO_GRID_ROW_UNIT_PX}px`,
    );
    expect(grid.style.getPropertyValue('--my-work-grid-gap')).toBe(
      `${MY_WORK_BENTO_GRID_GAP_PX}px`,
    );
  });

  it('passes children through into the grid', () => {
    const { container } = render(
      <MyWorkBentoGrid mode="standardLaptop">
        <div data-test-child="">child</div>
      </MyWorkBentoGrid>,
    );
    const grid = getGrid(container);
    expect(grid.querySelector('[data-test-child]')?.textContent).toBe('child');
  });
});

describe('useMyWorkBentoContext', () => {
  it('throws when used outside a MyWorkBentoGrid provider', () => {
    expect(() => renderHook(() => useMyWorkBentoContext())).toThrow(
      /must be used inside a <MyWorkBentoGrid>/,
    );
  });

  it('returns the active mode, columns, rowUnitPx, and gapPx from the surrounding grid', () => {
    const { result } = renderHook(() => useMyWorkBentoContext(), {
      wrapper: ({ children }) => <MyWorkBentoGrid mode="largeLaptop">{children}</MyWorkBentoGrid>,
    });
    expect(result.current).toEqual({
      mode: 'largeLaptop',
      columns: MY_WORK_RESPONSIVE_COLUMNS.largeLaptop,
      rowUnitPx: MY_WORK_BENTO_GRID_ROW_UNIT_PX,
      gapPx: MY_WORK_BENTO_GRID_GAP_PX,
    });
  });
});
