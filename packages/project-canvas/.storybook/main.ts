/**
 * Storybook main config — D-SF13-T08, D-10
 *
 * Framework: @storybook/react-vite
 * Stories glob: ../src/**\/*.stories.tsx
 * Addons: essentials, a11y
 */
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
