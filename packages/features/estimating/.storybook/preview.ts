/**
 * SF18-T08 Storybook preview defaults.
 *
 * @design D-SF18-T08
 */
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    layout: 'padded',
  },
};

export default preview;
