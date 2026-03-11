/**
 * Storybook preview configuration — @hbc/smart-empty-state
 * Provides mock complexity context for D-05 coaching tier rendering.
 */
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    layout: 'centered',
  },
};

export default preview;
