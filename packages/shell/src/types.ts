/**
 * Shell navigation types — Blueprint §1f, §2c.
 * Navigation is a shell concern; these types live here, not in @hbc/models.
 */

/** The 19 workspace identifiers — 14 Procore-aligned + 5 SPFx-only (Blueprint §2c, Phase 5). */
export type WorkspaceId =
  | 'project-hub'
  | 'accounting'
  | 'estimating'
  | 'scheduling'
  | 'buyout'
  | 'compliance'
  | 'contracts'
  | 'risk'
  | 'scorecard'
  | 'pmp'
  | 'leadership'
  | 'business-development'
  | 'admin'
  | 'site-control'
  | 'safety'
  | 'quality-control-warranty'
  | 'risk-management'
  | 'operational-excellence'
  | 'human-resources';

/** Runtime-iterable list of all workspace IDs (e.g. for AppLauncher grid). */
export const WORKSPACE_IDS: readonly WorkspaceId[] = [
  'project-hub',
  'accounting',
  'estimating',
  'scheduling',
  'buyout',
  'compliance',
  'contracts',
  'risk',
  'scorecard',
  'pmp',
  'leadership',
  'business-development',
  'admin',
  'site-control',
  'safety',
  'quality-control-warranty',
  'risk-management',
  'operational-excellence',
  'human-resources',
] as const;

/** A single item in the center tool-picker strip (Blueprint §2c). */
export interface ToolPickerItem {
  id: string;
  label: string;
  icon?: string;
  isActive: boolean;
  onClick: () => void;
}

/** A single item in the contextual sidebar (Blueprint §2c). */
export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  isActive: boolean;
  onClick: () => void;
}

/** Descriptor for a workspace tile in the AppLauncher grid. */
export interface WorkspaceDescriptor {
  id: WorkspaceId;
  label: string;
  icon?: string;
  description?: string;
}
