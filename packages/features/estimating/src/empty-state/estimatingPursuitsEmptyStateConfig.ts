import type {
  ISmartEmptyStateConfig,
  IEmptyStateContext,
  IEmptyStateConfig,
} from '@hbc/smart-empty-state';

export const estimatingPursuitsEmptyStateConfig: ISmartEmptyStateConfig = {
  resolve(context: IEmptyStateContext): IEmptyStateConfig {
    const { isLoadError, hasPermission, hasActiveFilters, isFirstVisit, currentUserRole } = context;

    if (isLoadError) {
      return {
        module: 'estimating',
        view: 'pursuits',
        classification: 'loading-failed',
        heading: 'Unable to load pursuits',
        description: 'Something went wrong while loading your pursuit data. Please try again.',
        primaryAction: {
          label: 'Retry',
          onClick: () => {},
          variant: 'button',
        },
      };
    }

    if (!hasPermission) {
      return {
        module: 'estimating',
        view: 'pursuits',
        classification: 'permission-empty',
        heading: 'Access restricted',
        description: 'You do not have permission to view pursuits. Contact your administrator for access.',
      };
    }

    if (hasActiveFilters) {
      return {
        module: 'estimating',
        view: 'pursuits',
        classification: 'filter-empty',
        heading: 'No pursuits match your filters',
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
        currentUserRole === 'estimator'
          ? 'Welcome! As an estimator, start by creating your first pursuit to begin tracking opportunities.'
          : 'Welcome to Pursuits! Create a new pursuit to begin tracking estimating opportunities.';

      return {
        module: 'estimating',
        view: 'pursuits',
        classification: 'first-use',
        heading: 'Welcome to Pursuits',
        description,
        primaryAction: {
          label: 'Create pursuit',
          href: '/estimating/pursuits/new',
          variant: 'button',
        },
        coachingTip: 'Pursuits help you track and manage estimating opportunities from lead to proposal.',
      };
    }

    return {
      module: 'estimating',
      view: 'pursuits',
      classification: 'truly-empty',
      heading: 'No pursuits yet',
      description: 'Create your first pursuit to start tracking estimating opportunities.',
      primaryAction: {
        label: 'Create pursuit',
        href: '/estimating/pursuits/new',
        variant: 'button',
      },
      secondaryAction: {
        label: 'Import pursuits',
        href: '/estimating/pursuits/import',
        variant: 'link',
      },
    };
  },
};
