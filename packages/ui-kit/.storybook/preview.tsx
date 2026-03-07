/**
 * Storybook preview — HbcThemeProvider decorator with theme switcher
 * Blueprint §1d — All stories wrapped with HB Intel design system theme
 * PH4.3 — Light / Field Mode theme switcher toolbar
 */
import * as React from 'react';
import type { Preview } from '@storybook/react';
import { HbcThemeProvider } from '../src/HbcAppShell/HbcThemeContext.js';
import { withMockAuth } from './decorators/withMockAuth';

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
    // PH4C.9 D-PH4C-15/D-PH4C-16: Storybook-only auth bypass with production guard.
    withMockAuth,
    (Story, context) => {
      const themeKey = (context.globals.theme as string) || 'light';
      const bgColor = themeKey === 'field' ? '#0F1419' : '#FAFBFC';
      // PH4C.11: Storybook controls provider mode through the same persisted flag used by apps.
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('hbc-field-mode', themeKey === 'field' ? 'true' : 'false');
      }
      return (
        <HbcThemeProvider>
          <div style={{ background: bgColor, minHeight: '100vh', padding: '1rem' }}>
            <Story />
          </div>
        </HbcThemeProvider>
      );
    },
  ],
  parameters: {
    controls: { expanded: true },
    layout: 'padded',
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'target-size', enabled: true },
        ],
      },
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag22aa', 'best-practice'],
        },
      },
    },
    viewport: {
      viewports: {
        fieldTablet: { name: 'Field Tablet', styles: { width: '1024px', height: '768px' } },
        fieldMobile: { name: 'Field Mobile', styles: { width: '390px', height: '844px' } },
      },
    },
  },
};

export default preview;
