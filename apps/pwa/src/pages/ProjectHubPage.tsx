import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { HbcButton, HbcTextField, HbcSelect, Text, Card, CardHeader, WorkspacePageShell, HbcDataTable } from '@hbc/ui-kit';
import type { ColumnDef, HbcSelectOption } from '@hbc/ui-kit';
import {
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
} from '@hbc/ui-kit/theme';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';
import type { IActiveProject } from '@hbc/models';
import { HbcProjectCanvas, registerReferenceTiles } from '@hbc/project-canvas';
import {
  PROJECT_HUB_BASELINE_REPORT_FAMILIES,
  PROJECT_HUB_REPORT_MODULE_AUDIT,
  getProjectHubReportsSummary,
  ProjectOperatingSurface,
  ExecutiveCockpitSurface,
  FieldTabletSurface,
  FinancialControlCenter,
  resolveProjectHubProfile,
} from '@hbc/features-project-hub';
import type {
  IProjectHubReportModuleAuditRow,
  ProjectHubProfileRole,
  ProjectHubDeviceClass,
} from '@hbc/features-project-hub';
import {
  getProjectHubPortfolioState,
  saveProjectHubPortfolioState,
} from '@hbc/shell';
import { useAuthStore } from '@hbc/auth';
import { useProjectHubContext } from '../hooks/useProjectHubContext.js';

// Register all reference tiles (idempotent — safe to call multiple times).
registerReferenceTiles();

// Stable empty array reference to prevent zustand selector re-render loops.
const EMPTY_ROLES: readonly string[] = [];

// ── Griffel styles governed by @hbc/ui-kit tokens ──────────────────────────
const usePortfolioStyles = makeStyles({
  filterBar: {
    display: 'flex',
    gap: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
    flexWrap: 'wrap',
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  filterLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${HBC_SPACE_MD * 12 + HBC_SPACE_SM}px, 1fr))`,
    gap: `${HBC_SPACE_MD}px`,
  },
  tableSection: {
    marginTop: `${HBC_SPACE_LG}px`,
  },
});

const useControlCenterStyles = makeStyles({
  headerSlot: {
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
    display: 'flex',
    gap: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
    alignItems: 'center',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${HBC_SPACE_MD * 13 + HBC_SPACE_SM + HBC_SPACE_XS}px, 1fr))`,
    gap: `${HBC_SPACE_MD}px`,
    marginTop: `${HBC_SPACE_LG}px`,
  },
  reportCardGrid: {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${HBC_SPACE_MD * 16 + HBC_SPACE_XS}px, 1fr))`,
    gap: `${HBC_SPACE_MD}px`,
    marginTop: `${HBC_SPACE_LG}px`,
  },
  sectionSpacing: {
    marginTop: `${HBC_SPACE_LG}px`,
  },
  cardBody: {
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
  },
  blockText: {
    display: 'block',
    marginTop: `${HBC_SPACE_SM}px`,
  },
  auditIntro: {
    display: 'block',
    marginTop: `${HBC_SPACE_SM}px`,
  },
  auditTable: {
    marginTop: `${HBC_SPACE_MD}px`,
  },
});

// ── Profile resolution helpers ──────────────────────────────────────────────

/**
 * Map auth-level resolved roles to the Project Hub profile role taxonomy.
 * Priority-ordered: the first matching role wins.
 */
function resolveProfileRole(resolvedRoles: readonly string[]): ProjectHubProfileRole {
  for (const r of resolvedRoles) {
    const lower = r.toLowerCase();
    if (/portfolio.*exec|executive.*review/.test(lower)) return 'portfolio-executive';
    if (/leadership/.test(lower)) return 'leadership';
    if (/safety.*lead/.test(lower)) return 'safety-leadership';
    if (/qa|qc|quality/.test(lower)) return 'qa-qc';
    if (/field.*eng/.test(lower)) return 'field-engineer';
    if (/superintendent/.test(lower)) return 'superintendent';
    if (/project.*exec/.test(lower)) return 'project-executive';
  }
  return 'project-manager';
}

/**
 * Detect device class from viewport width for profile resolution.
 */
function resolveDeviceClass(): ProjectHubDeviceClass {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'narrow';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

const columns: ColumnDef<IActiveProject, unknown>[] = [
  { accessorKey: 'name', header: 'Project Name' },
  { accessorKey: 'number', header: 'Number' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'startDate', header: 'Start Date' },
  { accessorKey: 'endDate', header: 'End Date' },
];

interface ReportAuditTableRow {
  readonly module: string;
  readonly implementation: string;
  readonly consumableToday: string;
  readonly baselineUsage: string;
}

const reportColumns: ColumnDef<ReportAuditTableRow, unknown>[] = [
  { accessorKey: 'module', header: 'Module' },
  { accessorKey: 'implementation', header: 'Implementation Status' },
  { accessorKey: 'consumableToday', header: 'Reports Can Consume Today' },
  { accessorKey: 'baselineUsage', header: 'Recommended Baseline Usage' },
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

const STATUS_FILTER_OPTIONS: HbcSelectOption[] = [
  { value: 'all', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Planning', label: 'Planning' },
];

const SORT_OPTIONS: HbcSelectOption[] = [
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
];

export interface ProjectHubPortfolioPageProps {
  projects: IActiveProject[];
  onProjectSelect: (projectId: string) => void;
}

export function ProjectHubPortfolioPage({
  projects,
  onProjectSelect,
}: ProjectHubPortfolioPageProps): ReactNode {
  useProjectHubContext(projects, null);

  const initialState = useMemo(() => getProjectHubPortfolioState(), []);
  const [search, setSearch] = useState(initialState.search);
  const [statusFilter, setStatusFilter] = useState(initialState.statusFilter);
  const [sortBy, setSortBy] = useState<'name' | 'status'>(initialState.sortBy);

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

  const portfolioStyles = usePortfolioStyles();

  return (
    <WorkspacePageShell layout="dashboard" title="Project Hub" suppressProjectContext>
      <div className={portfolioStyles.filterBar}>
        <HbcTextField
          label="Search"
          value={search}
          onChange={(value) => setSearch(value)}
          placeholder="Search by name or number"
        />
        <HbcSelect
          label="Status"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          options={STATUS_FILTER_OPTIONS}
        />
        <HbcSelect
          label="Sort"
          value={sortBy}
          onChange={(value) => setSortBy(value === 'status' ? 'status' : 'name')}
          options={SORT_OPTIONS}
        />
      </div>

      <div className={portfolioStyles.cardGrid}>
        {summaryCards.map((card) => (
          <Card key={card.label} size="small">
            <CardHeader
              header={<Text weight="semibold">{card.label}</Text>}
              description={<Text size={800} weight="bold">{card.value}</Text>}
            />
          </Card>
        ))}
      </div>

      <div className={portfolioStyles.tableSection}>
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
  onOpenReports?: () => void;
  onModuleOpen?: (slug: string) => void;
}

export function ProjectHubControlCenterPage({
  project,
  projects,
  section,
  onBackToPortfolio,
  onOpenReports: _onOpenReports,
  onModuleOpen,
}: ProjectHubControlCenterPageProps): ReactNode {
  useProjectHubContext(projects, project, section);

  // ── Auth context for profile resolution ──────────────────────────
  const userId = useAuthStore((state) => state.currentUser?.id ?? 'anonymous');
  const resolvedRoles = useAuthStore((state) => state.session?.resolvedRoles) ?? EMPTY_ROLES;

  // ── Profile-governed resolution ──────────────────────────────────
  const profileRole = useMemo(() => resolveProfileRole(resolvedRoles), [resolvedRoles]);
  const deviceClass = useMemo(() => resolveDeviceClass(), []);
  const profileResult = useMemo(
    () => resolveProjectHubProfile({ role: profileRole, deviceClass }),
    [profileRole, deviceClass],
  );
  const { profileId, layoutFamily } = profileResult;

  const reportsSummary = useMemo(() => getProjectHubReportsSummary(), []);
  const reportAuditRows = useMemo<ReportAuditTableRow[]>(
    () =>
      PROJECT_HUB_REPORT_MODULE_AUDIT.map((row: IProjectHubReportModuleAuditRow) => ({
        module: row.module,
        implementation: row.currentImplementationStatus,
        consumableToday: row.canReportsConsumeToday,
        baselineUsage: row.recommendedBaselineUsage,
      })),
    [],
  );

  const reportsSection = section === 'reports';
  const financialSection = section === 'financial';

  const ccStyles = useControlCenterStyles();

  const profileTitle =
    profileId === 'executive-cockpit'
      ? 'Project Hub — Executive Cockpit'
      : profileId === 'field-tablet-split-pane'
        ? 'Project Hub — Field Mode'
        : profileId === 'next-move-hub'
          ? 'Project Hub — Next Move Hub'
          : profileId === 'canvas-first-operating-layer'
            ? 'Project Hub — Canvas'
            : 'Project Hub Control Center';

  return (
    <WorkspacePageShell
      layout="dashboard"
      title={financialSection ? 'Financial Control Center' : reportsSection ? 'Project Hub Reports' : profileTitle}
      stickyHeader
      headerSlot={
        <div className={ccStyles.headerSlot}>
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
      {financialSection ? (
        <FinancialControlCenter
          projectId={project.id}
          onOpenSurface={() => {
            // Sub-page routes will be added in a follow-on prompt.
          }}
          onSecondaryAction={() => {
            // Will route to financial/history when sub-page exists
          }}
        />
      ) : reportsSection ? (
        <>
          <Text size={400}>
            This baseline Reports surface shows what Project Hub can actually support today. It does
            not replace the future P3-F1-governed registry, run-ledger, generation, and release
            lifecycle.
          </Text>

          <div className={ccStyles.summaryGrid}>
            <Card size="small">
              <CardHeader
                header={<Text weight="semibold">Baseline Families</Text>}
                description={<Text size={700} weight="bold">{String(reportsSummary.baselineFamilyCount)}</Text>}
              />
            </Card>
            <Card size="small">
              <CardHeader
                header={<Text weight="semibold">Partial Source Modules</Text>}
                description={<Text size={700} weight="bold">{String(reportsSummary.partialSourceCount)}</Text>}
              />
            </Card>
            <Card size="small">
              <CardHeader
                header={<Text weight="semibold">Blocked Source Modules</Text>}
                description={<Text size={700} weight="bold">{String(reportsSummary.blockedSourceCount)}</Text>}
              />
            </Card>
            <Card size="small">
              <CardHeader
                header={<Text weight="semibold">Closeout Artifact Families</Text>}
                description={<Text size={700} weight="bold">{String(reportsSummary.closeoutArtifactFamilyCount)}</Text>}
              />
            </Card>
          </div>

          <div className={ccStyles.reportCardGrid}>
            {PROJECT_HUB_BASELINE_REPORT_FAMILIES.map((family) => (
              <Card key={family.key} size="small">
                <CardHeader
                  header={<Text weight="semibold">{family.label}</Text>}
                  description={<Text size={200}>{family.currentStatus}</Text>}
                />
                <div className={ccStyles.cardBody}>
                  <Text size={200}>{family.purpose}</Text>
                  <Text size={200} className={ccStyles.blockText}>
                    Source modules: {family.sourceModules.join(', ')}
                  </Text>
                  <Text size={200} className={ccStyles.blockText}>
                    Recommended usage: {family.recommendedUsage}
                  </Text>
                  <Text size={200} className={ccStyles.blockText}>
                    Current blocker: {family.blocker}
                  </Text>
                </div>
              </Card>
            ))}
          </div>

          <div className={ccStyles.sectionSpacing}>
            <Text size={500} weight="semibold">
              Module readiness audit
            </Text>
            <Text size={200} className={ccStyles.auditIntro}>
              This matrix stays strict about repo truth: module-local report definitions do not
              count as a central Reports source until a normalized adapter exists.
            </Text>
            <div className={ccStyles.auditTable}>
              <HbcDataTable<ReportAuditTableRow>
                data={reportAuditRows}
                columns={reportColumns}
                height="480px"
              />
            </div>
          </div>
        </>
      ) : layoutFamily === 'executive' ? (
        <ExecutiveCockpitSurface
          projectId={project.id}
          onOpenModule={onModuleOpen ?? (() => {})}
        />
      ) : layoutFamily === 'field-tablet' ? (
        <FieldTabletSurface
          onOpenModule={onModuleOpen ?? (() => {})}
        />
      ) : (
        <ProjectOperatingSurface
          canvasSlot={
            <HbcProjectCanvas
              projectId={project.id}
              userId={userId}
              role={profileRole}
              editable
              title=""
            />
          }
          onModuleOpen={onModuleOpen ?? (() => {})}
        />
      )}
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
  useProjectHubContext(projects, null);

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
