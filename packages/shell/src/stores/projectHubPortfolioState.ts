export interface ProjectHubPortfolioState {
  search: string;
  statusFilter: string;
  sortBy: 'name' | 'status';
  scrollY: number;
}

const STORAGE_KEY = 'hbc-project-hub-portfolio-state';

const DEFAULT_STATE: ProjectHubPortfolioState = {
  search: '',
  statusFilter: 'all',
  sortBy: 'name',
  scrollY: 0,
};

export function getProjectHubPortfolioState(): ProjectHubPortfolioState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;

    const parsed = JSON.parse(raw) as Partial<ProjectHubPortfolioState>;
    return {
      search: typeof parsed.search === 'string' ? parsed.search : DEFAULT_STATE.search,
      statusFilter:
        typeof parsed.statusFilter === 'string' ? parsed.statusFilter : DEFAULT_STATE.statusFilter,
      sortBy: parsed.sortBy === 'status' ? 'status' : 'name',
      scrollY: typeof parsed.scrollY === 'number' ? parsed.scrollY : DEFAULT_STATE.scrollY,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveProjectHubPortfolioState(
  nextState: Partial<ProjectHubPortfolioState>,
): ProjectHubPortfolioState {
  const merged = {
    ...getProjectHubPortfolioState(),
    ...nextState,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // localStorage unavailable or full — fail silently
  }

  return merged;
}

export function clearProjectHubPortfolioState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // fail silently
  }
}

