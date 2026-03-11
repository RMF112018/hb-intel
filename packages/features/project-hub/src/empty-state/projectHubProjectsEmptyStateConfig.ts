import type {
  ISmartEmptyStateConfig,
  IEmptyStateContext,
  IEmptyStateConfig,
} from '@hbc/smart-empty-state';

export const projectHubProjectsEmptyStateConfig: ISmartEmptyStateConfig = {
  resolve(context: IEmptyStateContext): IEmptyStateConfig {
    const { isLoadError, hasPermission, hasActiveFilters, isFirstVisit, currentUserRole } = context;

    if (isLoadError) {
      return {
        module: 'project-hub',
        view: 'projects',
        classification: 'loading-failed',
        heading: 'Unable to load projects',
        description: 'Something went wrong while loading your project data. Please try again.',
        primaryAction: {
          label: 'Retry',
          onClick: () => {},
          variant: 'button',
        },
      };
    }

    if (!hasPermission) {
      return {
        module: 'project-hub',
        view: 'projects',
        classification: 'permission-empty',
        heading: 'Access restricted',
        description: 'You do not have permission to view projects. Contact your administrator for access.',
      };
    }

    if (hasActiveFilters) {
      return {
        module: 'project-hub',
        view: 'projects',
        classification: 'filter-empty',
        heading: 'No projects match your filters',
        description: 'Try adjusting or clearing your filters to see results.',
        filterClearAction: {
          label: 'Clear filters',
          onClick: () => {},
          variant: 'button',
        },
      };
    }

    if (isFirstVisit) {
      const description =
        currentUserRole === 'project-manager'
          ? 'Welcome! As a project manager, start by creating a project to organize tasks, budgets, and team assignments.'
          : 'Welcome to Project Hub! Create a new project to begin organizing and tracking your work.';

      return {
        module: 'project-hub',
        view: 'projects',
        classification: 'first-use',
        heading: 'Welcome to Project Hub',
        description,
        primaryAction: {
          label: 'Create project',
          href: '/project-hub/projects/new',
          variant: 'button',
        },
        coachingTip: 'Project Hub helps you organize tasks, track budgets, and manage team assignments in one place.',
      };
    }

    return {
      module: 'project-hub',
      view: 'projects',
      classification: 'truly-empty',
      heading: 'No projects yet',
      description: 'Create your first project to start organizing and tracking your work.',
      primaryAction: {
        label: 'Create project',
        href: '/project-hub/projects/new',
        variant: 'button',
      },
      secondaryAction: {
        label: 'Import projects',
        href: '/project-hub/projects/import',
        variant: 'link',
      },
    };
  },
};
