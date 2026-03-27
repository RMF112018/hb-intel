import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@hbc/shell', () => ({
  useProjectStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ activeProject: null, availableProjects: [] }),
  useNavStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ activeItemId: null, activeWorkspace: null }),
}));
vi.mock('@hbc/auth', () => ({ usePermission: () => true }));

import { HbcThemeProvider } from '../../HbcAppShell/HbcThemeContext.js';
import { MultiColumnLayout } from '../MultiColumnLayout.js';

function renderWithTheme(ui: React.ReactNode) {
  return render(<HbcThemeProvider>{ui}</HbcThemeProvider>);
}

describe('MultiColumnLayout', () => {
  it('renders center slot', () => {
    renderWithTheme(
      <MultiColumnLayout config={{}} centerSlot={<div>Center Content</div>} />,
    );
    expect(screen.getByText('Center Content')).toBeInTheDocument();
  });

  it('renders left slot when provided', () => {
    renderWithTheme(
      <MultiColumnLayout
        config={{ left: { width: 260 } }}
        leftSlot={<div>Left Rail</div>}
        centerSlot={<div>Center</div>}
      />,
    );
    expect(screen.getByText('Left Rail')).toBeInTheDocument();
  });

  it('renders right slot when provided on desktop', () => {
    // MultiColumnLayout uses window.innerWidth for viewport detection.
    // In test env, SSR fallback is 'desktop', so right slot should render
    // when hideOnMobile/hideOnTablet are explicitly false.
    renderWithTheme(
      <MultiColumnLayout
        config={{ right: { width: 300, hideOnMobile: false, hideOnTablet: false } }}
        centerSlot={<div>Center</div>}
        rightSlot={<div>Right Rail</div>}
      />,
    );
    expect(screen.getByText('Right Rail')).toBeInTheDocument();
  });

  it('renders bottom slot when provided', () => {
    renderWithTheme(
      <MultiColumnLayout
        config={{}}
        centerSlot={<div>Center</div>}
        bottomSlot={<div>Bottom Strip</div>}
      />,
    );
    expect(screen.getByText('Bottom Strip')).toBeInTheDocument();
  });

  it('has the multi-column-layout testid', () => {
    const { container } = renderWithTheme(
      <MultiColumnLayout config={{}} centerSlot={<div>Content</div>} />,
    );
    expect(container.querySelector('[data-testid="multi-column-layout"]')).toBeInTheDocument();
  });

  it('supports custom testId', () => {
    const { container } = renderWithTheme(
      <MultiColumnLayout config={{}} centerSlot={<div>Content</div>} testId="my-layout" />,
    );
    expect(container.querySelector('[data-testid="my-layout"]')).toBeInTheDocument();
  });
});
