import { isVisibleForAudience } from './visibility.js';
import {
  DEFAULT_PRIORITY_ACTIONS_CONFIG,
  DEFAULT_TOOL_LAUNCHER_CONFIG,
  type PriorityActionGroup,
  type PriorityActionItem,
  type PriorityActionsRailConfig,
  type ToolLauncherItem,
  type ToolLauncherWorkHubConfig,
} from '../webparts/utilityContracts.js';

export interface NormalizedPriorityActionItem extends PriorityActionItem {
  groupId: string;
  groupTitle: string;
}

export interface NormalizedPriorityActionGroup {
  id: string;
  title: string;
  order?: number;
  actions: NormalizedPriorityActionItem[];
}

export interface NormalizedPriorityActionsRail {
  heading: string;
  groups: NormalizedPriorityActionGroup[];
}

export interface NormalizedToolLauncherGroup {
  id: string;
  title: string;
  order?: number;
  items: ToolLauncherItem[];
}

export interface NormalizedToolLauncherWorkHub {
  heading: string;
  groups: NormalizedToolLauncherGroup[];
}

function hasText(value: string | undefined): value is string {
  return Boolean(value?.trim());
}

function byOrderThenTitle(a: { order?: number; title: string }, b: { order?: number; title: string }): number {
  const aOrder = Number.isFinite(a.order) ? (a.order as number) : Number.MAX_SAFE_INTEGER;
  const bOrder = Number.isFinite(b.order) ? (b.order as number) : Number.MAX_SAFE_INTEGER;
  if (aOrder !== bOrder) {
    return aOrder - bOrder;
  }
  return a.title.localeCompare(b.title);
}

function normalizePriorityGroups(rawGroups: PriorityActionGroup[] | undefined): Map<string, PriorityActionGroup> {
  const groups = new Map<string, PriorityActionGroup>();

  for (const group of rawGroups ?? []) {
    if (!hasText(group.id) || !hasText(group.title)) {
      continue;
    }
    groups.set(group.id.trim(), {
      id: group.id.trim(),
      title: group.title.trim(),
      order: group.order,
    });
  }

  return groups;
}

function normalizePriorityItems(
  rawActions: PriorityActionItem[] | undefined,
  activeAudience: string | undefined,
  maxItems: number,
  groups: Map<string, PriorityActionGroup>,
): NormalizedPriorityActionItem[] {
  const seen = new Set<string>();
  const normalized: NormalizedPriorityActionItem[] = [];

  for (const action of rawActions ?? []) {
    if (!hasText(action.id) || !hasText(action.title) || !hasText(action.href)) {
      continue;
    }

    const id = action.id.trim();
    if (seen.has(id)) {
      continue;
    }

    if (!isVisibleForAudience(action.audiences, activeAudience)) {
      continue;
    }

    const rawGroupId = hasText(action.group) ? action.group.trim() : 'general';
    const mappedGroup = groups.get(rawGroupId);

    normalized.push({
      ...action,
      id,
      title: action.title.trim(),
      href: action.href.trim(),
      description: hasText(action.description) ? action.description.trim() : undefined,
      groupId: mappedGroup?.id ?? rawGroupId,
      groupTitle: mappedGroup?.title ?? 'General Actions',
      badge:
        hasText(action.badge?.label)
          ? {
              label: action.badge?.label.trim(),
              variant: action.badge?.variant ?? 'info',
            }
          : undefined,
    });

    seen.add(id);
    if (normalized.length >= maxItems) {
      break;
    }
  }

  return normalized.sort(byOrderThenTitle);
}

export function normalizePriorityActionsRailConfig(
  input: Partial<PriorityActionsRailConfig> | undefined,
  activeAudience?: string,
): NormalizedPriorityActionsRail {
  const maxItems = Number.isFinite(input?.maxItems) && (input?.maxItems ?? 0) > 0 ? (input?.maxItems as number) : DEFAULT_PRIORITY_ACTIONS_CONFIG.maxItems;
  const heading = hasText(input?.heading) ? input?.heading.trim() : DEFAULT_PRIORITY_ACTIONS_CONFIG.heading;
  const groupsMap = normalizePriorityGroups(input?.groups);
  const items = normalizePriorityItems(input?.actions, activeAudience, maxItems, groupsMap);

  const grouped = new Map<string, NormalizedPriorityActionGroup>();
  for (const item of items) {
    if (!grouped.has(item.groupId)) {
      grouped.set(item.groupId, {
        id: item.groupId,
        title: item.groupTitle,
        order: groupsMap.get(item.groupId)?.order,
        actions: [],
      });
    }
    grouped.get(item.groupId)?.actions.push(item);
  }

  const groups = [...grouped.values()].sort(byOrderThenTitle);

  return {
    heading,
    groups,
  };
}

function normalizeLauncherItems(items: ToolLauncherItem[] | undefined, activeAudience: string | undefined, maxItemsPerGroup: number): ToolLauncherItem[] {
  const seen = new Set<string>();
  const normalized: ToolLauncherItem[] = [];

  for (const item of items ?? []) {
    if (!hasText(item.id) || !hasText(item.title) || !hasText(item.href)) {
      continue;
    }
    const id = item.id.trim();
    if (seen.has(id) || !isVisibleForAudience(item.audiences, activeAudience)) {
      continue;
    }

    normalized.push({
      ...item,
      id,
      title: item.title.trim(),
      href: item.href.trim(),
      description: hasText(item.description) ? item.description.trim() : undefined,
      iconKey: hasText(item.iconKey) ? item.iconKey.trim() : undefined,
      badge:
        hasText(item.badge?.label)
          ? {
              label: item.badge?.label.trim(),
              variant: item.badge?.variant ?? 'neutral',
            }
          : undefined,
    });
    seen.add(id);

    if (normalized.length >= maxItemsPerGroup) {
      break;
    }
  }

  return normalized.sort(byOrderThenTitle);
}

export function normalizeToolLauncherWorkHubConfig(
  input: Partial<ToolLauncherWorkHubConfig> | undefined,
  activeAudience?: string,
): NormalizedToolLauncherWorkHub {
  const heading = hasText(input?.heading) ? input?.heading.trim() : DEFAULT_TOOL_LAUNCHER_CONFIG.heading;
  const maxGroups = Number.isFinite(input?.maxGroups) && (input?.maxGroups ?? 0) > 0 ? (input?.maxGroups as number) : DEFAULT_TOOL_LAUNCHER_CONFIG.maxGroups;
  const maxItemsPerGroup = Number.isFinite(input?.maxItemsPerGroup) && (input?.maxItemsPerGroup ?? 0) > 0
    ? (input?.maxItemsPerGroup as number)
    : DEFAULT_TOOL_LAUNCHER_CONFIG.maxItemsPerGroup;

  const normalizedGroups: NormalizedToolLauncherGroup[] = [];

  for (const group of input?.groups ?? []) {
    if (!hasText(group.id) || !hasText(group.title)) {
      continue;
    }

    const items = normalizeLauncherItems(group.items, activeAudience, maxItemsPerGroup);
    if (items.length === 0) {
      continue;
    }

    normalizedGroups.push({
      id: group.id.trim(),
      title: group.title.trim(),
      order: group.order,
      items,
    });

    if (normalizedGroups.length >= maxGroups) {
      break;
    }
  }

  normalizedGroups.sort(byOrderThenTitle);

  return {
    heading,
    groups: normalizedGroups,
  };
}
