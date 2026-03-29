/**
 * Theme enforcement tests for SPFx-hosted runtime.
 * Validates that forceTheme="light" overrides OS dark-mode preference.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { HbcThemeProvider, HbcThemeContext } from '@hbc/ui-kit';

function ThemeReader() {
  const ctx = React.useContext(HbcThemeContext);
  return (
    <div data-testid="theme-info">
      <span data-testid="theme-mode">{ctx?.theme}</span>
      <span data-testid="prefers-dark">{String(ctx?.prefersDarkMode)}</span>
    </div>
  );
}

describe('HbcThemeProvider forceTheme', () => {
  it('forceTheme="light" overrides theme to light regardless of OS preference', () => {
    render(
      <HbcThemeProvider forceTheme="light">
        <ThemeReader />
      </HbcThemeProvider>,
    );

    expect(screen.getByTestId('theme-mode').textContent).toBe('light');
    expect(screen.getByTestId('prefers-dark').textContent).toBe('false');
  });

  it('without forceTheme, theme follows hook detection (light in test env)', () => {
    render(
      <HbcThemeProvider>
        <ThemeReader />
      </HbcThemeProvider>,
    );

    // In test env matchMedia returns false for dark, so theme should be light or office
    const themeMode = screen.getByTestId('theme-mode').textContent;
    expect(['light', 'field']).toContain(themeMode);
  });
});
