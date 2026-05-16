import type { MyProjectLinkItem } from '@hbc/models/myWork';
import type { MyWorkResponsiveMode } from '../../layout/useMyWorkContainerBreakpoint.js';

export const MY_PROJECTS_VISIBLE_COUNT_BY_MODE: Readonly<Record<MyWorkResponsiveMode, number>> =
  Object.freeze({
    phone: 3,
    tabletPortrait: 4,
    tabletLandscape: 4,
    smallLaptop: 4,
    standardLaptop: 6,
    largeLaptop: 6,
    desktop: 6,
    ultrawide: 6,
  });

export function resolveMyProjectsVisibleCount(mode: MyWorkResponsiveMode): number {
  return MY_PROJECTS_VISIBLE_COUNT_BY_MODE[mode];
}

export function sortMyProjectsForDisplay(
  items: readonly MyProjectLinkItem[],
): readonly MyProjectLinkItem[] {
  return [...items].sort((left, right) => {
    const name = left.projectName.localeCompare(right.projectName, undefined, {
      sensitivity: 'base',
    });
    if (name !== 0) return name;
    const number = left.projectNumber.localeCompare(right.projectNumber);
    if (number !== 0) return number;
    return left.recordKey.localeCompare(right.recordKey);
  });
}

export function selectVisibleProjects(
  items: readonly MyProjectLinkItem[],
  mode: MyWorkResponsiveMode,
  expanded: boolean,
): readonly MyProjectLinkItem[] {
  if (expanded) return items;
  return items.slice(0, resolveMyProjectsVisibleCount(mode));
}

export function normalizeProjectSearchQuery(input: string): string {
  return input.trim().toLowerCase();
}

export function filterMyProjectsByQuery(
  items: readonly MyProjectLinkItem[],
  query: string,
): readonly MyProjectLinkItem[] {
  const normalized = normalizeProjectSearchQuery(query);
  if (normalized.length === 0) return items;
  return items.filter((item) => {
    return (
      item.projectName.toLowerCase().includes(normalized) ||
      item.projectNumber.toLowerCase().includes(normalized)
    );
  });
}
