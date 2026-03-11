import type {
  ISmartEmptyStateConfig,
  IEmptyStateContext,
  IEmptyStateConfig,
} from '@hbc/smart-empty-state';

export const adminProvisioningEmptyStateConfig: ISmartEmptyStateConfig = {
  resolve(context: IEmptyStateContext): IEmptyStateConfig {
    const { isLoadError, hasPermission, hasActiveFilters, isFirstVisit, currentUserRole } = context;

    if (isLoadError) {
      return {
        module: 'admin',
        view: 'provisioning',
        classification: 'loading-failed',
        heading: 'Unable to load provisioning',
        description: 'Something went wrong while loading provisioning data. Please try again.',
        primaryAction: {
          label: 'Retry',
          onClick: () => {},
          variant: 'button',
        },
      };
    }

    if (!hasPermission) {
      return {
        module: 'admin',
        view: 'provisioning',
        classification: 'permission-empty',
        heading: 'Access restricted',
        description:
          currentUserRole !== 'admin'
            ? 'Only administrators can manage provisioning. Contact your administrator for access.'
            : 'You do not have permission to view provisioning. Contact your administrator for access.',
      };
    }

    if (hasActiveFilters) {
      return {
        module: 'admin',
        view: 'provisioning',
        classification: 'filter-empty',
        heading: 'No provisioning records match your filters',
        description: 'Try adjusting or clearing your filters to see results.',
        filterClearAction: {
          label: 'Clear filters',
          onClick: () => {},
          variant: 'button',
        },
      };
    }

    if (isFirstVisit) {
      return {
        module: 'admin',
        view: 'provisioning',
        classification: 'first-use',
        heading: 'Welcome to Provisioning',
        description: 'Set up provisioning to manage user access, roles, and workspace configurations.',
        primaryAction: {
          label: 'Start provisioning',
          href: '/admin/provisioning/new',
          variant: 'button',
        },
        coachingTip: 'Provisioning lets you manage user accounts, assign roles, and configure workspace settings.',
      };
    }

    return {
      module: 'admin',
      view: 'provisioning',
      classification: 'truly-empty',
      heading: 'No provisioning records',
      description: 'Create a provisioning record to begin managing user access and workspace configuration.',
      primaryAction: {
        label: 'Start provisioning',
        href: '/admin/provisioning/new',
        variant: 'button',
      },
    };
  },
};
