/**
 * Storybook preview — FluentProvider decorator with hbcLightTheme
 * Blueprint §1d — All stories wrapped with HB Intel design system theme
 */
import * as React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import type { Preview } from '@storybook/react';
import { hbcLightTheme } from '../src/theme/index.js';

const preview: Preview = {
  decorators: [
    (Story) => (
      <FluentProvider theme={hbcLightTheme}>
        <Story />
      </FluentProvider>
    ),
  ],
  parameters: {
    controls: { expanded: true },
    layout: 'padded',
  },
};

export default preview;
