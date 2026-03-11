/**
 * Storybook stories for HbcSmartEmptyState — SF11-T08 Testing Strategy
 *
 * Matrix: 5 classifications × 2 variants (full-page, inline) + 3 complexity scenarios
 * Validates D-01 classification rendering, D-03 CTA model, D-05 coaching tiers, D-06 variant consistency.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { HbcSmartEmptyState } from '../components/HbcSmartEmptyState.js';
import type {
  ISmartEmptyStateConfig,
  IEmptyStateContext,
  EmptyStateVariant,
} from '../types/ISmartEmptyState.js';

// --- Resolver configs for each classification ---

const firstUseConfig: ISmartEmptyStateConfig = {
  resolve: () => ({
    module: 'estimating',
    view: 'pursuits',
    classification: 'first-use',
    heading: 'Welcome to Pursuits',
    description: 'Create your first pursuit to begin tracking estimating opportunities.',
    primaryAction: { label: 'Create pursuit', href: '/estimating/pursuits/new', variant: 'button' },
    coachingTip: 'Pursuits help you track and manage estimating opportunities from lead to proposal.',
  }),
};

const trulyEmptyConfig: ISmartEmptyStateConfig = {
  resolve: () => ({
    module: 'estimating',
    view: 'pursuits',
    classification: 'truly-empty',
    heading: 'No pursuits yet',
    description: 'Create your first pursuit to start tracking estimating opportunities.',
    primaryAction: { label: 'Create pursuit', href: '/estimating/pursuits/new', variant: 'button' },
    secondaryAction: { label: 'Import pursuits', href: '/estimating/pursuits/import', variant: 'link' },
  }),
};

const filterEmptyConfig: ISmartEmptyStateConfig = {
  resolve: () => ({
    module: 'estimating',
    view: 'pursuits',
    classification: 'filter-empty',
    heading: 'No pursuits match your filters',
    description: 'Try adjusting or clearing your filters to see results.',
    filterClearAction: { label: 'Clear filters', onClick: () => {}, variant: 'button' },
  }),
};

const permissionEmptyConfig: ISmartEmptyStateConfig = {
  resolve: () => ({
    module: 'estimating',
    view: 'pursuits',
    classification: 'permission-empty',
    heading: 'Access restricted',
    description: 'You do not have permission to view pursuits. Contact your administrator for access.',
  }),
};

const loadingFailedConfig: ISmartEmptyStateConfig = {
  resolve: () => ({
    module: 'estimating',
    view: 'pursuits',
    classification: 'loading-failed',
    heading: 'Unable to load pursuits',
    description: 'Something went wrong while loading your pursuit data. Please try again.',
    primaryAction: { label: 'Retry', onClick: () => {}, variant: 'button' },
  }),
};

// --- Shared context ---

const defaultContext: IEmptyStateContext = {
  module: 'estimating',
  view: 'pursuits',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'Estimator',
  isLoadError: false,
};

// --- Meta ---

const meta: Meta<typeof HbcSmartEmptyState> = {
  title: 'SmartEmptyState/HbcSmartEmptyState',
  component: HbcSmartEmptyState,
  argTypes: {
    variant: {
      control: 'radio',
      options: ['full-page', 'inline'] satisfies EmptyStateVariant[],
    },
  },
};

export default meta;
type Story = StoryObj<typeof HbcSmartEmptyState>;

// --- Full-Page Variant Stories (5 classifications) ---

export const FirstUseFullPage: Story = {
  name: 'First Use (full-page)',
  args: {
    config: firstUseConfig,
    context: defaultContext,
    variant: 'full-page',
  },
};

export const TrulyEmptyFullPage: Story = {
  name: 'Truly Empty (full-page)',
  args: {
    config: trulyEmptyConfig,
    context: defaultContext,
    variant: 'full-page',
  },
};

export const FilterEmptyFullPage: Story = {
  name: 'Filter Empty (full-page)',
  args: {
    config: filterEmptyConfig,
    context: defaultContext,
    variant: 'full-page',
  },
};

export const PermissionEmptyFullPage: Story = {
  name: 'Permission Empty (full-page)',
  args: {
    config: permissionEmptyConfig,
    context: defaultContext,
    variant: 'full-page',
  },
};

export const LoadingFailedFullPage: Story = {
  name: 'Loading Failed (full-page)',
  args: {
    config: loadingFailedConfig,
    context: defaultContext,
    variant: 'full-page',
  },
};

// --- Inline Variant Stories (5 classifications) ---

export const FirstUseInline: Story = {
  name: 'First Use (inline)',
  args: {
    config: firstUseConfig,
    context: defaultContext,
    variant: 'inline',
  },
};

export const TrulyEmptyInline: Story = {
  name: 'Truly Empty (inline)',
  args: {
    config: trulyEmptyConfig,
    context: defaultContext,
    variant: 'inline',
  },
};

export const FilterEmptyInline: Story = {
  name: 'Filter Empty (inline)',
  args: {
    config: filterEmptyConfig,
    context: defaultContext,
    variant: 'inline',
  },
};

export const PermissionEmptyInline: Story = {
  name: 'Permission Empty (inline)',
  args: {
    config: permissionEmptyConfig,
    context: defaultContext,
    variant: 'inline',
  },
};

export const LoadingFailedInline: Story = {
  name: 'Loading Failed (inline)',
  args: {
    config: loadingFailedConfig,
    context: defaultContext,
    variant: 'inline',
  },
};

// --- Complexity Scenario Stories (D-05) ---
// These use first-use classification since it has a coaching tip.
// Complexity tier is controlled by the @hbc/complexity mock in .storybook/preview.

export const CoachingEssential: Story = {
  name: 'Coaching — Essential (tip inline)',
  args: {
    config: firstUseConfig,
    context: defaultContext,
    variant: 'full-page',
  },
  parameters: {
    docs: {
      description: {
        story: 'Essential tier: coaching tip renders as inline text (D-05).',
      },
    },
  },
};

export const CoachingStandard: Story = {
  name: 'Coaching — Standard (collapsible hint)',
  args: {
    config: firstUseConfig,
    context: defaultContext,
    variant: 'full-page',
  },
  parameters: {
    docs: {
      description: {
        story: 'Standard tier: coaching tip renders as collapsible disclosure (D-05).',
      },
    },
  },
};

export const CoachingExpert: Story = {
  name: 'Coaching — Expert (tip hidden)',
  args: {
    config: firstUseConfig,
    context: defaultContext,
    variant: 'full-page',
  },
  parameters: {
    docs: {
      description: {
        story: 'Expert tier: coaching tip is suppressed (D-05).',
      },
    },
  },
};
