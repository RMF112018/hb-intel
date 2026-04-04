export type UtilityBadgeVariant = 'neutral' | 'info' | 'warning' | 'success' | 'critical';

export interface UtilityBadge {
  label: string;
  variant?: UtilityBadgeVariant;
}

export interface PriorityActionItem {
  id: string;
  title: string;
  href: string;
  description?: string;
  group?: string;
  order?: number;
  audiences?: string[];
  badge?: UtilityBadge;
}

export interface PriorityActionGroup {
  id: string;
  title: string;
  order?: number;
}

export interface PriorityActionsRailConfig {
  heading?: string;
  groups?: PriorityActionGroup[];
  actions?: PriorityActionItem[];
  maxItems?: number;
}

export interface ToolLauncherItem {
  id: string;
  title: string;
  href: string;
  description?: string;
  iconKey?: string;
  order?: number;
  audiences?: string[];
  badge?: UtilityBadge;
}

export interface ToolLauncherGroup {
  id: string;
  title: string;
  order?: number;
  items: ToolLauncherItem[];
}

export interface ToolLauncherWorkHubConfig {
  heading?: string;
  groups?: ToolLauncherGroup[];
  maxGroups?: number;
  maxItemsPerGroup?: number;
}

export const DEFAULT_PRIORITY_ACTIONS_CONFIG: Required<Pick<PriorityActionsRailConfig, 'heading' | 'maxItems'>> = {
  heading: 'Priority Actions',
  maxItems: 8,
};

export const DEFAULT_TOOL_LAUNCHER_CONFIG: Required<Pick<ToolLauncherWorkHubConfig, 'heading' | 'maxGroups' | 'maxItemsPerGroup'>> = {
  heading: 'Tool Launcher / Work Hub',
  maxGroups: 4,
  maxItemsPerGroup: 6,
};
