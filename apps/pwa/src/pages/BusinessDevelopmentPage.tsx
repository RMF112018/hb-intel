/**
 * BusinessDevelopmentPage — MVP workspace (Blueprint §2c).
 * Lead pipeline with data grid + filter wiring (D-PH6F-08).
 */
import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  Text,
  Card,
  CardHeader,
  HbcDataTable,
  HbcStatusBadge,
  WorkspacePageShell,
  ListLayout,
} from '@hbc/ui-kit';
import type { ColumnDef, ListFilterDef } from '@hbc/ui-kit';
import {
  useListFilterStoreBinding,
  decodeFiltersFromUrl,
  encodeFiltersToUrl,
} from '@hbc/query-hooks';
import { FILTER_KEYS } from '../features/filterKeys.js';

interface LeadItem {
  name: string;
  client: string;
  value: string;
  stage: string;
  probability: string;
}

const columns: ColumnDef<LeadItem, unknown>[] = [
  { accessorKey: 'name', header: 'Opportunity' },
  { accessorKey: 'client', header: 'Client' },
  { accessorKey: 'value', header: 'Value' },
  { accessorKey: 'stage', header: 'Stage' },
  { accessorKey: 'probability', header: 'Win %' },
];

const MOCK_LEADS: LeadItem[] = [
  { name: 'Metro Hospital Expansion', client: 'Metro Health System', value: '$8.5M', stage: 'Proposal', probability: '75%' },
  { name: 'Westside Office Park', client: 'Westside Developers', value: '$12.2M', stage: 'Qualification', probability: '40%' },
  { name: 'Airport Terminal B Reno', client: 'City Aviation Authority', value: '$22.0M', stage: 'Negotiation', probability: '85%' },
  { name: 'University Science Center', client: 'State University', value: '$15.8M', stage: 'Pursuit', probability: '55%' },
];

const STAGE_OPTIONS = [
  { value: 'Proposal', label: 'Proposal' },
  { value: 'Qualification', label: 'Qualification' },
  { value: 'Negotiation', label: 'Negotiation' },
  { value: 'Pursuit', label: 'Pursuit' },
];

const primaryFilters: ListFilterDef[] = [
  { key: 'stage', label: 'Stage', type: 'select', options: STAGE_OPTIONS },
];

export function BusinessDevelopmentPage(): ReactNode {
  // D-PH6F-08: Hydrate filters from URL on mount
  useEffect(() => {
    decodeFiltersFromUrl();
  }, []);

  // D-PH6F-08: Wire filter store to ListLayout props
  const {
    activeFilters,
    onFilterChange,
    onClearAllFilters,
    viewMode,
    onViewModeChange,
  } = useListFilterStoreBinding(FILTER_KEYS.BD_LEADS);

  // D-PH6F-08: Sync filter changes to URL via replaceState
  useEffect(() => {
    const hasFilters = Object.keys(activeFilters).length > 0;
    const url = new URL(window.location.href);
    if (hasFilters) {
      url.searchParams.set('filters', encodeFiltersToUrl(FILTER_KEYS.BD_LEADS));
    } else {
      url.searchParams.delete('filters');
    }
    window.history.replaceState(null, '', url.toString());
  }, [activeFilters]);

  // Client-side filtering based on active filters
  const filteredLeads = useMemo(() => {
    const stageFilter = activeFilters['stage'];
    if (!stageFilter) return MOCK_LEADS;
    const stageValue = Array.isArray(stageFilter) ? stageFilter : [stageFilter];
    return MOCK_LEADS.filter((lead) => stageValue.includes(lead.stage));
  }, [activeFilters]);

  const summaryCards = [
    { label: 'Pipeline Value', value: '$58.5M' },
    { label: 'Active Pursuits', value: '12' },
    { label: 'Win Rate', value: '34%' },
    { label: 'Weighted Value', value: '$21.2M' },
  ];

  return (
    <WorkspacePageShell layout="dashboard" title="Business Development">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {summaryCards.map((card) => (
          <Card key={card.label} size="small">
            <CardHeader
              header={<Text weight="semibold">{card.label}</Text>}
              description={<Text size={700} weight="bold">{card.value}</Text>}
            />
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Text size={500} weight="semibold">Lead Pipeline</Text>
          <HbcStatusBadge label={`${filteredLeads.length} active`} variant="info" />
        </div>
        <ListLayout
          primaryFilters={primaryFilters}
          activeFilters={activeFilters}
          onFilterChange={onFilterChange}
          onClearAllFilters={onClearAllFilters}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          showingCount={filteredLeads.length}
          totalCount={MOCK_LEADS.length}
        >
          <HbcDataTable<LeadItem>
            data={filteredLeads}
            columns={columns}
            height="300px"
          />
        </ListLayout>
      </div>
    </WorkspacePageShell>
  );
}
