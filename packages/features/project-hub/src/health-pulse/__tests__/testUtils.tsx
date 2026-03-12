import type { ReactElement } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { HbcThemeProvider } from '@hbc/ui-kit';

export function renderWithTheme(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return render(<HbcThemeProvider>{ui}</HbcThemeProvider>, options);
}
