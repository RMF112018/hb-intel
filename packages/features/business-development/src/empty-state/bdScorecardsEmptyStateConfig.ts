import type {
  ISmartEmptyStateConfig,
  IEmptyStateContext,
  IEmptyStateConfig,
} from '@hbc/smart-empty-state';

export const bdScorecardsEmptyStateConfig: ISmartEmptyStateConfig = {
  resolve(context: IEmptyStateContext): IEmptyStateConfig {
    const { isLoadError, hasPermission, hasActiveFilters, isFirstVisit, currentUserRole } = context;

    if (isLoadError) {
      return {
        module: 'business-development',
        view: 'scorecards',
        classification: 'loading-failed',
        heading: 'Unable to load scorecards',
        description: 'Something went wrong while loading scorecard data. Please try again.',
        primaryAction: {
          label: 'Retry',
          onClick: () => {},
          variant: 'button',
        },
      };
    }

    if (!hasPermission) {
      return {
        module: 'business-development',
        view: 'scorecards',
        classification: 'permission-empty',
        heading: 'Access restricted',
        description: 'You do not have permission to view scorecards. Contact your administrator for access.',
      };
    }

    if (hasActiveFilters) {
      return {
        module: 'business-development',
        view: 'scorecards',
        classification: 'filter-empty',
        heading: 'No scorecards match your filters',
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
        currentUserRole === 'executive'
          ? 'Welcome! Your executive summary dashboard will populate as scorecards are created across the organization.'
          : 'Welcome to Scorecards! Create a new scorecard to begin tracking business development performance.';

      return {
        module: 'business-development',
        view: 'scorecards',
        classification: 'first-use',
        heading: 'Welcome to Scorecards',
        description,
        primaryAction: {
          label: 'Create scorecard',
          href: '/business-development/scorecards/new',
          variant: 'button',
        },
        coachingTip: 'Scorecards help you measure and track business development performance across teams.',
      };
    }

    return {
      module: 'business-development',
      view: 'scorecards',
      classification: 'truly-empty',
      heading: 'No scorecards yet',
      description: 'Create your first scorecard to start tracking business development performance.',
      primaryAction: {
        label: 'Create scorecard',
        href: '/business-development/scorecards/new',
        variant: 'button',
      },
      secondaryAction: {
        label: 'Import scorecards',
        href: '/business-development/scorecards/import',
        variant: 'link',
      },
    };
  },
};
