/**
 * Storybook 8 configuration — @hbc/ui-kit
 * Blueprint §2h — Storybook for UI/a11y testing
 * Individual .stories.tsx files deferred to Phase 3 (dev-harness)
 */
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
