import { describe, expect, it } from 'vitest';
import type { MyProjectLinkItem } from '@hbc/models/myWork';
import {
  MY_WORK_RESPONSIVE_MODES,
  type MyWorkResponsiveMode,
} from '../../layout/useMyWorkContainerBreakpoint.js';
import {
  MY_PROJECTS_VISIBLE_COUNT_BY_MODE,
  resolveMyProjectsVisibleCount,
  selectVisibleProjects,
  sortMyProjectsForDisplay,
} from './myProjectPortfolioPresentation.js';

function makeItem(overrides: Partial<MyProjectLinkItem>): MyProjectLinkItem {
  const base: MyProjectLinkItem = {
    recordKey: 'r:1',
    source: 'projects-only',
    projectName: 'Project',
    projectNumber: '00-000-00',
    assignmentRoles: [],
    sharePointAction: {
      state: 'unavailable',
      kind: 'none',
      label: 'SharePoint unavailable',
    },
    procoreAction: {
      state: 'unavailable',
      label: 'Procore unavailable',
    },
    provenance: {},
    warnings: [],
  };
  return { ...base, ...overrides };
}

const EXPECTED_VISIBLE_COUNT: Record<MyWorkResponsiveMode, number> = {
  phone: 3,
  tabletPortrait: 4,
  tabletLandscape: 4,
  smallLaptop: 4,
  standardLaptop: 6,
  largeLaptop: 6,
  desktop: 6,
  ultrawide: 6,
};

describe('MY_PROJECTS_VISIBLE_COUNT_BY_MODE', () => {
  it.each(MY_WORK_RESPONSIVE_MODES)('locks visible count for %s', (mode) => {
    expect(MY_PROJECTS_VISIBLE_COUNT_BY_MODE[mode]).toBe(EXPECTED_VISIBLE_COUNT[mode]);
  });
});

describe('resolveMyProjectsVisibleCount', () => {
  it.each(MY_WORK_RESPONSIVE_MODES)(
    'returns the locked visible count for %s',
    (mode) => {
      expect(resolveMyProjectsVisibleCount(mode)).toBe(EXPECTED_VISIBLE_COUNT[mode]);
    },
  );
});

describe('sortMyProjectsForDisplay', () => {
  it('sorts case-insensitively by project name', () => {
    const items = [
      makeItem({ recordKey: 'a', projectName: 'bravo' }),
      makeItem({ recordKey: 'b', projectName: 'Alpha' }),
      makeItem({ recordKey: 'c', projectName: 'CHARLIE' }),
    ];
    const sorted = sortMyProjectsForDisplay(items);
    expect(sorted.map((item) => item.projectName)).toEqual(['Alpha', 'bravo', 'CHARLIE']);
  });

  it('tie-breaks identical names by project number', () => {
    const items = [
      makeItem({ recordKey: 'a', projectName: 'Same', projectNumber: '24-200-02' }),
      makeItem({ recordKey: 'b', projectName: 'Same', projectNumber: '24-100-01' }),
    ];
    const sorted = sortMyProjectsForDisplay(items);
    expect(sorted.map((item) => item.projectNumber)).toEqual(['24-100-01', '24-200-02']);
  });

  it('tie-breaks identical name and number by recordKey', () => {
    const items = [
      makeItem({ recordKey: 'projects:200', projectName: 'Same', projectNumber: '24-100-01' }),
      makeItem({ recordKey: 'legacy:100', projectName: 'Same', projectNumber: '24-100-01' }),
    ];
    const sorted = sortMyProjectsForDisplay(items);
    expect(sorted.map((item) => item.recordKey)).toEqual(['legacy:100', 'projects:200']);
  });

  it('returns a new array and does not mutate input', () => {
    const items: MyProjectLinkItem[] = [
      makeItem({ recordKey: 'a', projectName: 'Zulu' }),
      makeItem({ recordKey: 'b', projectName: 'Alpha' }),
    ];
    const inputSnapshot = items.map((item) => item.recordKey);
    const sorted = sortMyProjectsForDisplay(items);
    expect(sorted).not.toBe(items);
    expect(items.map((item) => item.recordKey)).toEqual(inputSnapshot);
  });

  it('returns an empty array for empty input', () => {
    expect(sortMyProjectsForDisplay([])).toEqual([]);
  });
});

describe('selectVisibleProjects', () => {
  const ten: readonly MyProjectLinkItem[] = Array.from({ length: 10 }, (_, index) =>
    makeItem({ recordKey: `r${index}`, projectName: String.fromCharCode(65 + index) }),
  );

  it('slices to the locked visible count when not expanded', () => {
    const sliced = selectVisibleProjects(ten, 'desktop', false);
    expect(sliced).toHaveLength(6);
    expect(sliced.map((item) => item.recordKey)).toEqual([
      'r0',
      'r1',
      'r2',
      'r3',
      'r4',
      'r5',
    ]);
  });

  it('returns the full list when expanded', () => {
    const sliced = selectVisibleProjects(ten, 'desktop', true);
    expect(sliced).toHaveLength(10);
  });

  it('uses the per-mode visible count for slicing', () => {
    expect(selectVisibleProjects(ten, 'phone', false)).toHaveLength(3);
    expect(selectVisibleProjects(ten, 'smallLaptop', false)).toHaveLength(4);
    expect(selectVisibleProjects(ten, 'ultrawide', false)).toHaveLength(6);
  });

  it('does not mutate input', () => {
    const inputSnapshot = ten.map((item) => item.recordKey);
    selectVisibleProjects(ten, 'desktop', false);
    expect(ten.map((item) => item.recordKey)).toEqual(inputSnapshot);
  });
});
