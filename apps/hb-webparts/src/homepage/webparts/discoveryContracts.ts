export type DiscoveryResourceType =
  | 'tool'
  | 'form'
  | 'policy'
  | 'system'
  | 'teamSpace'
  | 'destination';

export interface DiscoveryCategory {
  id: string;
  title: string;
  description?: string;
  order?: number;
}

export interface DiscoveryResourceItem {
  id: string;
  title: string;
  href: string;
  type: DiscoveryResourceType;
  categoryId?: string;
  description?: string;
  iconKey?: string;
  promoted?: boolean;
  order?: number;
  audiences?: string[];
  keywords?: string[];
}

export interface DiscoveryQuickPath {
  id: string;
  title: string;
  href: string;
  description?: string;
  iconKey?: string;
  order?: number;
  audiences?: string[];
}

export interface DiscoveryStrategy {
  mode?: 'curatedFirst';
  futureSearchEnhancement?: 'deferred' | 'planned';
}

export interface SmartSearchWayfindingConfig {
  heading?: string;
  searchPlaceholder?: string;
  categories?: DiscoveryCategory[];
  resources?: DiscoveryResourceItem[];
  quickPaths?: DiscoveryQuickPath[];
  strategy?: DiscoveryStrategy;
  maxPromotedItems?: number;
  maxResultsPerCategory?: number;
}

export const DEFAULT_SMART_SEARCH_WAYFINDING_CONFIG: Required<
  Pick<
    SmartSearchWayfindingConfig,
    'heading' | 'searchPlaceholder' | 'maxPromotedItems' | 'maxResultsPerCategory'
  >
> = {
  heading: 'Smart Search and Wayfinding',
  searchPlaceholder: 'Find tools, forms, policies, teams, and destinations',
  maxPromotedItems: 4,
  maxResultsPerCategory: 6,
};
