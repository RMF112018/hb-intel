/**
 * Workspace metadata — Blueprint §2c.
 * Static config per workspace: label, description, toolPickerItems, sidebarItems.
 */
import type { WorkspaceId, WorkspaceDescriptor, ToolPickerItem, SidebarItem } from '@hbc/shell';

export const WORKSPACE_DESCRIPTORS: Record<WorkspaceId, WorkspaceDescriptor> = {
  'project-hub': { id: 'project-hub', label: 'Project Hub', description: 'Portfolio overview and project navigation' },
  accounting: { id: 'accounting', label: 'Accounting', description: 'Financial management and cost tracking' },
  estimating: { id: 'estimating', label: 'Estimating', description: 'Bid tracking and cost estimation' },
  scheduling: { id: 'scheduling', label: 'Scheduling', description: 'Project scheduling and timelines' },
  buyout: { id: 'buyout', label: 'Buyout', description: 'Procurement and subcontractor management' },
  compliance: { id: 'compliance', label: 'Compliance', description: 'Regulatory compliance tracking' },
  contracts: { id: 'contracts', label: 'Contracts', description: 'Contract management and administration' },
  risk: { id: 'risk', label: 'Risk', description: 'Risk assessment and mitigation' },
  scorecard: { id: 'scorecard', label: 'Scorecard', description: 'Project performance metrics' },
  pmp: { id: 'pmp', label: 'PMP', description: 'Project management planning' },
  leadership: { id: 'leadership', label: 'Leadership', description: 'Executive dashboards and KPIs' },
  'business-development': { id: 'business-development', label: 'Business Development', description: 'Lead pipeline and opportunity tracking' },
  admin: { id: 'admin', label: 'Admin', description: 'System administration and settings' },
  'site-control': { id: 'site-control', label: 'Site Control', description: 'Field operations management' },
  safety: { id: 'safety', label: 'Safety', description: 'Safety incident tracking and inspections' },
  'quality-control-warranty': { id: 'quality-control-warranty', label: 'Quality Control & Warranty', description: 'Quality checks and warranty tracking' },
  'risk-management': { id: 'risk-management', label: 'Risk Management', description: 'Risk register and mitigation planning' },
  'operational-excellence': { id: 'operational-excellence', label: 'Operational Excellence', description: 'Process improvement and metrics' },
  'human-resources': { id: 'human-resources', label: 'Human Resources', description: 'Staffing and certifications management' },
};

type ToolPickerFactory = (navigate: (id: string) => void) => ToolPickerItem[];
type SidebarFactory = (navigate: (id: string) => void) => SidebarItem[];

export const WORKSPACE_TOOL_PICKERS: Partial<Record<WorkspaceId, ToolPickerFactory>> = {
  accounting: (navigate) => [
    { id: 'overview', label: 'Overview', isActive: true, onClick: () => navigate('overview') },
    { id: 'budgets', label: 'Budgets', isActive: false, onClick: () => navigate('budgets') },
    { id: 'invoices', label: 'Invoices', isActive: false, onClick: () => navigate('invoices') },
  ],
  estimating: (navigate) => [
    { id: 'bids', label: 'Bids', isActive: true, onClick: () => navigate('bids') },
    { id: 'templates', label: 'Templates', isActive: false, onClick: () => navigate('templates') },
  ],
};

export const WORKSPACE_SIDEBARS: Partial<Record<WorkspaceId, SidebarFactory>> = {
  'project-hub': (navigate) => [
    { id: 'portfolio', label: 'Portfolio', isActive: true, onClick: () => navigate('portfolio') },
    { id: 'recent', label: 'Recent', isActive: false, onClick: () => navigate('recent') },
    { id: 'favorites', label: 'Favorites', isActive: false, onClick: () => navigate('favorites') },
  ],
};
