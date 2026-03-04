/**
 * Storybook preview — FluentProvider decorator with theme switcher
 * Blueprint §1d — All stories wrapped with HB Intel design system theme
 * PH4.3 — Light / Field Mode theme switcher toolbar
 */
import * as React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import type { Preview } from '@storybook/react';
import { hbcLightTheme, hbcFieldTheme } from '../src/theme/index.js';
import type { HbcTheme } from '../src/theme/index.js';

const THEMES: Record<string, HbcTheme> = {
  light: hbcLightTheme,
  field: hbcFieldTheme,
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'HB Intel theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'field', title: 'Field Mode' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (Story, context) => {
      const themeKey = (context.globals.theme as string) || 'light';
      const theme = THEMES[themeKey] ?? hbcLightTheme;
      const bgColor = themeKey === 'field' ? '#0F1419' : '#FFFFFF';
      return (
        <FluentProvider theme={theme}>
          <div style={{ background: bgColor, minHeight: '100vh', padding: '1rem' }}>
            <Story />
          </div>
        </FluentProvider>
      );
    },
  ],
  parameters: {
    controls: { expanded: true },
    layout: 'padded',
  },
};

export default preview;
