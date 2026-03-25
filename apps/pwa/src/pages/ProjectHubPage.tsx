import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { HbcButton, Text, Card, CardHeader, WorkspacePageShell, HbcDataTable } from '@hbc/ui-kit';
import type { ColumnDef } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';
import type { IActiveProject } from '@hbc/models';
import {
  getProjectHubPortfolioState,
  reconcileProjectContext,
  saveProjectHubPortfolioState,
  useProjectStore,
} from '@hbc/shell';

const columns: ColumnDef<IActiveProject, unknown>[] = [
  { accessorKey: 'name', header: 'Project Name' },
  { accessorKey: 'number', header: 'Number' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'startDate', header: 'Start Date' },
  { accessorKey: 'endDate', header: 'End Date' },
];

const PROJECT_HUB_NO_ACCESS_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: context.hasPermission ? 'truly-empty' : 'permission-empty',
    heading: context.hasPermission ? 'Project Not Available' : 'Project Hub Not Available',
    description: context.hasPermission
      ? 'The requested project could not be opened in Project Hub. Use the portfolio root or the project switcher to choose an authorized project.'
      : 'You do not currently have an available Project Hub project context.',
    primaryAction: {
      label: 'Back to Portfolio',
      href: '/project-hub',
    },
    coachingTip:
      'Project Hub keeps invalid or unauthorized contexts in-shell instead of redirecting you somewhere else.',
  }),
};

function syncProjectStore(projects: IActiveProject[], activeProject: IActiveProject | null): void {
  const store = useProjectStore.getState();
  store.setAvailableProjects(projects);

  if (!activeProject) {
    if (store.activeProject !== null) {
      store.setActiveProject(null);
    }
    return;
  }

  const reconciliation = reconcileProjectContext({
    routeProjectId: activeProject.id,
    storeProjectId: store.activeProject?.id ?? null,
  });

  if (reconciliation.storeNeedsSync) {
    store.setActiveProject(activeProject);
  }
}

function sortProjects(
  projects: IActiveProject[],
  sortBy: 'name' | 'status',
): IActiveProject[] {
  return [...projects].sort((left, right) => {
    if (sortBy === 'status') {
      return left.status.localeCompare(right.status) || left.name.localeCompare(right.name);
    }
    return left.name.localeCompare(right.name);
  });
}

export interface ProjectHubPortfolioPageProps {
  projects: IActiveProject[];
  onProjectSelect: (projectId: string) => void;
}

export function ProjectHubPortfolioPage({
  projects,
  onProjectSelect,
}: ProjectHubPortfolioPageProps): ReactNode {
  const initialState = useMemo(() => getProjectHubPortfolioState(), []);
  const [search, setSearch] = useState(initialState.search);
  const [statusFilter, setStatusFilter] = useState(initialState.statusFilter);
  const [sortBy, setSortBy] = useState<'name' | 'status'>(initialState.sortBy);

  useEffect(() => {
    syncProjectStore(projects, null);
  }, [projects]);

  useEffect(() => {
    saveProjectHubPortfolioState({ search, statusFilter, sortBy });
  }, [search, statusFilter, sortBy]);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && initialState.scrollY > 0) {
      window.scrollTo({ top: initialState.scrollY, behavior: 'auto' });
    }
  }, [initialState.scrollY]);

  useEffect(() => {
    const handleScroll = () => {
      saveProjectHubPortfolioState({ scrollY: window.scrollY });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const visibleProjects = useMemo(() => {
    const searched = projects.filter((project) => {
      const haystack = `${project.name} ${project.number}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
    const filtered =
      statusFilter === 'all'
        ? searched
        : searched.filter((project) => project.status === statusFilter);
    return sortProjects(filtered, sortBy);
  }, [projects, search, statusFilter, sortBy]);

  const summaryCards = [
    { label: 'Visible Projects', value: String(visibleProjects.length) },
    {
      label: 'Active',
      value: String(visibleProjects.filter((project) => project.status === 'Active').length),
    },
    {
      label: 'Planning',
      value: String(visibleProjects.filter((project) => project.status === 'Planning').length),
    },
  ];

  return (
    <WorkspacePageShell layout="dashboard" title="Project Hub" suppressProjectContext>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Text size={200}>Search</Text>
          <input
            aria-label="Project search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or number"
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Text size={200}>Status</Text>
          <select
            aria-label="Project status filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All</option>
            <option value="Active">Active</option>
            <option value="Planning">Planning</option>
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Text size={200}>Sort</Text>
          <select
            aria-label="Project sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value === 'status' ? 'status' : 'name')}
          >
            <option value="name">Name</option>
            <option value="status">Status</option>
          </select>
        </label>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {summaryCards.map((card) => (
          <Card key={card.label} size="small">
            <CardHeader
              header={<Text weight="semibold">{card.label}</Text>}
              description={<Text size={800} weight="bold">{card.value}</Text>}
            />
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <HbcDataTable<IActiveProject>
          data={visibleProjects}
          columns={columns}
          height="400px"
          onRowClick={(project) => onProjectSelect(project.id)}
        />
      </div>
    </WorkspacePageShell>
  );
}

export interface ProjectHubControlCenterPageProps {
  project: IActiveProject;
  projects: IActiveProject[];
  section?: string | null;
  onBackToPortfolio: () => void;
}

export function ProjectHubControlCenterPage({
  project,
  projects,
  section,
  onBackToPortfolio,
}: ProjectHubControlCenterPageProps): ReactNode {
  useEffect(() => {
    syncProjectStore(projects, project);
  }, [project, projects]);

  const cards = [
    { label: 'Project Status', value: project.status },
    { label: 'Project Number', value: project.number },
    { label: 'Start Date', value: project.startDate },
    { label: 'End Date', value: project.endDate },
  ];

  return (
    <WorkspacePageShell
      layout="dashboard"
      title="Project Hub Control Center"
      stickyHeader
      headerSlot={
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <HbcButton variant="secondary" onClick={onBackToPortfolio}>
            Back to Portfolio
          </HbcButton>
          {section ? (
            <Text size={200}>Current section: {section}</Text>
          ) : (
            <Text size={200}>Current section: Control Center</Text>
          )}
        </div>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {cards.map((card) => (
          <Card key={card.label} size="small">
            <CardHeader
              header={<Text weight="semibold">{card.label}</Text>}
              description={<Text size={700} weight="bold">{card.value}</Text>}
            />
          </Card>
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <Text size={500} weight="semibold">
          Project-scoped entry is now route-canonical.
        </Text>
        <Text size={300} style={{ display: 'block', marginTop: 8 }}>
          Refresh, deep links, and in-shell project switching all keep this Control Center scoped to{' '}
          {project.name}.
        </Text>
      </div>
    </WorkspacePageShell>
  );
}

export interface ProjectHubNoAccessPageProps {
  projects: IActiveProject[];
  reason: 'zero-projects' | 'project-not-found' | 'project-unavailable';
}

export function ProjectHubNoAccessPage({
  projects,
  reason,
}: ProjectHubNoAccessPageProps): ReactNode {
  useEffect(() => {
    syncProjectStore(projects, null);
  }, [projects]);

  const context: IEmptyStateContext = {
    module: 'project-hub',
    view: reason,
    hasActiveFilters: false,
    hasPermission: projects.length > 0,
    isFirstVisit: false,
    currentUserRole: 'user',
    isLoadError: false,
  };

  return (
    <WorkspacePageShell layout="landing" title="Project Hub" suppressProjectContext>
      <HbcSmartEmptyState
        config={PROJECT_HUB_NO_ACCESS_CONFIG}
        context={context}
        variant="full-page"
      />
    </WorkspacePageShell>
  );
}
