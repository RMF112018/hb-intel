/**
 * Storybook preview config — D-SF13-T08
 *
 * Minimal parameters for project-canvas stories.
 */
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
